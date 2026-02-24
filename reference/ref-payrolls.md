## DTO

package payroll

type GetPayrollsFilterRequest struct {
Period string `form:"period"`
PeriodStart string `form:"period_start"`
PeriodEnd string `form:"period_end"`
DepartmentID string `form:"department_id"`
Status string `form:"status"`
}

type PayrollQueryFilter struct {
PeriodStart *string
PeriodEnd *string
DepartmentID *string
Status *string
}

type CreatePayrollRequest struct {
EmployeeID string `json:"employee_id" binding:"required,uuid"`
PeriodStart string `json:"period_start" binding:"required"`
PeriodEnd string `json:"period_end" binding:"required"`
BaseSalary int64 `json:"base_salary" binding:"required"`
Allowance int64 `json:"allowance"`
OvertimeHours int64 `json:"overtime_hours"`
OvertimeRate int64 `json:"overtime_rate"`
Deduction int64 `json:"deduction"`
AllowanceItems []PayrollComponentInput `json:"allowance_items"`
DeductionItems []PayrollComponentInput `json:"deduction_items"`
}

type RegeneratePayrollRequest struct {
BaseSalary int64 `json:"base_salary" binding:"required"`
Allowance int64 `json:"allowance"`
OvertimeHours int64 `json:"overtime_hours"`
OvertimeRate int64 `json:"overtime_rate"`
Deduction int64 `json:"deduction"`
AllowanceItems []PayrollComponentInput `json:"allowance_items"`
DeductionItems []PayrollComponentInput `json:"deduction_items"`
}

type PayrollComponentInput struct {
ComponentName string `json:"component_name" binding:"required"`
Quantity int64 `json:"quantity"`
UnitAmount int64 `json:"unit_amount" binding:"required"`
Notes \*string `json:"notes"`
}

type PayrollComponentResponse struct {
ID string `json:"id"`
ComponentType string `json:"component_type"`
ComponentName string `json:"component_name"`
Quantity int64 `json:"quantity"`
UnitAmount int64 `json:"unit_amount"`
TotalAmount int64 `json:"total_amount"`
Notes \*string `json:"notes,omitempty"`
}

type PayrollBreakdownLine struct {
Label string `json:"label"`
Quantity *int64 `json:"quantity,omitempty"`
UnitAmount *int64 `json:"unit_amount,omitempty"`
Amount int64 `json:"amount"`
Notes \*string `json:"notes,omitempty"`
}

type PayrollBreakdownResponse struct {
PayrollID string `json:"payroll_id"`
EmployeeID string `json:"employee_id"`
PeriodStart string `json:"period_start"`
PeriodEnd string `json:"period_end"`
Status string `json:"status"`
BaseSalary PayrollBreakdownLine `json:"base_salary"`
Allowances []PayrollBreakdownLine `json:"allowances"`
AllowanceTotal int64 `json:"allowance_total"`
Overtime PayrollBreakdownLine `json:"overtime"`
Deductions []PayrollBreakdownLine `json:"deductions"`
DeductionTotal int64 `json:"deduction_total"`
NetSalary int64 `json:"net_salary"`
}

type PayrollResponse struct {
ID string `json:"id"`
CompanyID string `json:"company_id"`
EmployeeID string `json:"employee_id"`
PeriodStart string `json:"period_start"`
PeriodEnd string `json:"period_end"`
BaseSalary int64 `json:"base_salary"`
TotalAllowance int64 `json:"total_allowance"`
OvertimeHours int64 `json:"overtime_hours"`
OvertimeRate int64 `json:"overtime_rate"`
TotalOvertime int64 `json:"total_overtime"`
TotalDeduction int64 `json:"total_deduction"`
Allowance int64 `json:"allowance"`
Deduction int64 `json:"deduction"`
NetSalary int64 `json:"net_salary"`
Status string `json:"status"`
CreatedBy string `json:"created_by"`
PaidAt *string `json:"paid_at,omitempty"`
ApprovedBy *string `json:"approved_by,omitempty"`
ApprovedAt *string `json:"approved_at,omitempty"`
PayslipURL *string `json:"payslip_url,omitempty"`
PayslipGeneratedAt \*string `json:"payslip_generated_at,omitempty"`
Components []PayrollComponentResponse `json:"components,omitempty"`
}

## Route

payrolls := r.Group("/payrolls")
payrolls.Use(middleware.AuthMiddleware())
{
payrolls.GET("", middleware.RBACAuthorize(rbacService, "payroll", "read"), handler.GetAll)
payrolls.GET("/:id", middleware.RBACAuthorize(rbacService, "payroll", "read"), handler.GetById)
payrolls.GET("/:id/breakdown", middleware.RBACAuthorize(rbacService, "payroll", "read"), handler.GetBreakdown)
payrolls.GET("/:id/payslip/download", middleware.RBACAuthorize(rbacService, "payroll", "read"), handler.DownloadPayslip)
if redisClient != nil {
payrolls.POST(
"",
middleware.Idempotency(redisClient),
middleware.RBACAuthorize(rbacService, "payroll", "create"),
handler.Create,
)
} else {
payrolls.POST("", middleware.RBACAuthorize(rbacService, "payroll", "create"), handler.Create)
}
payrolls.POST("/:id/regenerate", middleware.RBACAuthorize(rbacService, "payroll", "create"), handler.Regenerate)
payrolls.POST("/:id/approve", middleware.RBACAuthorize(rbacService, "payroll", "approve"), handler.Approve)
payrolls.POST("/:id/mark-paid", middleware.RBACAuthorize(rbacService, "payroll", "pay"), handler.MarkAsPaid)
payrolls.DELETE("/:id", middleware.RBACAuthorize(rbacService, "payroll", "delete"), handler.Delete)
}

## Handler


func getActorID(c *gin.Context) string {
	actorID := c.GetString("employee_id")
	if actorID == "" {
		actorID = c.GetString("user_id_validated")
	}
	return actorID
}

func (h *Handler) writeServiceError(c *gin.Context, err error) {
	httpErr := apperror.ToHTTP(err)
	response.Error(c, httpErr.Status, httpErr.Code, httpErr.Message, httpErr.Details)
}

func (h *Handler) Create(c *gin.Context) {
	lockKey, _ := c.Get("idempotency_lock_key")
	cacheKey, _ := c.Get("idempotency_cache_key")

	if h.rdb != nil {
		if lk, ok := lockKey.(string); ok && lk != "" {
			defer h.rdb.Del(c.Request.Context(), lk)
		}
	}

	companyID := c.GetString("company_id")
	actorID := getActorID(c)

	var req CreatePayrollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Input tidak valid", err.Error())
		return
	}

	resp, err := h.service.Create(c.Request.Context(), companyID, actorID, req)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}

	if h.rdb != nil {
		if ck, ok := cacheKey.(string); ok && ck != "" {
			if payload, marshalErr := json.Marshal(resp); marshalErr == nil {
				_ = h.rdb.Set(c.Request.Context(), ck, payload, 24*time.Hour).Err()
			}
		}
	}

	response.Success(c, http.StatusCreated, resp, nil)
}

func (h *Handler) GetAll(c *gin.Context) {
	ctx := c.Request.Context()
	companyID := c.GetString("company_id")
	var filterReq GetPayrollsFilterRequest
	if err := c.ShouldBindQuery(&filterReq); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Input tidak valid", err.Error())
		return
	}

	resp, err := h.service.GetAll(ctx, companyID, filterReq)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if pageSize < 1 {
		pageSize = 10
	}

	total := int64(len(resp))
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > len(resp) {
		start = len(resp)
	}
	if end > len(resp) {
		end = len(resp)
	}

	meta := response.NewPaginationMeta(total, page, pageSize)
	response.Success(c, http.StatusOK, resp[start:end], &meta)
}

func (h *Handler) GetById(c *gin.Context) {
	ctx := c.Request.Context()
	targetID := c.Param("id")
	companyID := c.GetString("company_id")

	resp, err := h.service.GetByID(ctx, companyID, targetID)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}

	response.Success(c, http.StatusOK, resp, nil)
}

func (h *Handler) GetBreakdown(c *gin.Context) {
	ctx := c.Request.Context()
	targetID := c.Param("id")
	companyID := c.GetString("company_id")

	resp, err := h.service.GetBreakdown(ctx, companyID, targetID)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}

	response.Success(c, http.StatusOK, resp, nil)
}

func (h *Handler) DownloadPayslip(c *gin.Context) {
	ctx := c.Request.Context()
	targetID := c.Param("id")
	companyID := c.GetString("company_id")

	resp, err := h.service.GetByID(ctx, companyID, targetID)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}
	if resp.PayslipURL == nil || *resp.PayslipURL == "" {
		h.writeServiceError(c, payrollerrors.ErrPayslipNotGenerated)
		return
	}

	c.Redirect(http.StatusTemporaryRedirect, *resp.PayslipURL)
}

func (h *Handler) Regenerate(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	companyID := c.GetString("company_id")
	actorID := getActorID(c)

	var req RegeneratePayrollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Input tidak valid", err.Error())
		return
	}

	resp, err := h.service.Regenerate(ctx, companyID, actorID, id, req)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}

	response.Success(c, http.StatusOK, resp, nil)
}

func (h *Handler) Approve(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	companyID := c.GetString("company_id")
	actorID := getActorID(c)

	resp, err := h.service.Approve(ctx, companyID, actorID, id)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}

	response.Success(c, http.StatusOK, resp, nil)
}

func (h *Handler) MarkAsPaid(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	companyID := c.GetString("company_id")
	actorID := getActorID(c)

	resp, err := h.service.MarkAsPaid(ctx, companyID, actorID, id)
	if err != nil {
		h.writeServiceError(c, err)
		return
	}

	response.Success(c, http.StatusOK, resp, nil)
}

func (h *Handler) Delete(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	companyID := c.GetString("company_id")

	if err := h.service.Delete(ctx, companyID, id); err != nil {
		h.writeServiceError(c, err)
		return
	}

	response.Success(c, http.StatusOK, gin.H{"deleted": true}, nil)
}