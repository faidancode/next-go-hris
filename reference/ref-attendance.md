## DTO
package attendance

type ClockInRequest struct {
	Latitude  *float64 `json:"latitude"`
	Longitude *float64 `json:"longitude"`
	Source    string   `json:"source"`
	Notes     *string  `json:"notes"`
}

type ClockOutRequest struct {
	Latitude  *float64 `json:"latitude"`
	Longitude *float64 `json:"longitude"`
	Notes     *string  `json:"notes"`
}

type AttendanceResponse struct {
	ID             string   `json:"id"`
	CompanyID      string   `json:"company_id"`
	EmployeeID     string   `json:"employee_id"`
	AttendanceDate string   `json:"attendance_date"`
	ClockIn        string   `json:"clock_in"`
	ClockOut       *string  `json:"clock_out,omitempty"`
	Latitude       *float64 `json:"latitude,omitempty"`
	Longitude      *float64 `json:"longitude,omitempty"`
	Status         string   `json:"status"`
	Source         string   `json:"source"`
	ExternalRef    *string  `json:"external_ref,omitempty"`
	Notes          *string  `json:"notes,omitempty"`
}


## Route

func RegisterRoutes(r *gin.RouterGroup, h *Handler, rbacService rbac.Service) {
	attendances := r.Group("/attendances")
	attendances.Use(middleware.AuthMiddleware())
	{
		attendances.GET("", middleware.RBACAuthorize(rbacService, "attendance", "read"), h.GetAll)
		attendances.POST("/clock-in", middleware.RBACAuthorize(rbacService, "attendance", "create"), h.ClockIn)
		attendances.POST("/clock-out", middleware.RBACAuthorize(rbacService, "attendance", "create"), h.ClockOut)
	}
}

## Handler

func (h *Handler) ClockIn(c *gin.Context) {
	companyID := c.GetString("company_id")
	employeeID := c.GetString("employee_id")
	if employeeID == "" {
		employeeID = c.GetString("user_id_validated")
	}

	var req ClockInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Input tidak valid", err.Error())
		return
	}

	resp, err := h.service.ClockIn(c.Request.Context(), companyID, employeeID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
		return
	}
	response.Success(c, http.StatusCreated, resp, nil)
}

func (h *Handler) ClockOut(c *gin.Context) {
	companyID := c.GetString("company_id")
	employeeID := c.GetString("employee_id")
	if employeeID == "" {
		employeeID = c.GetString("user_id_validated")
	}

	var req ClockOutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Input tidak valid", err.Error())
		return
	}

	resp, err := h.service.ClockOut(c.Request.Context(), companyID, employeeID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, resp, nil)
}

func (h *Handler) GetAll(c *gin.Context) {
	companyID := c.GetString("company_id")
	resp, err := h.service.GetAll(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
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
