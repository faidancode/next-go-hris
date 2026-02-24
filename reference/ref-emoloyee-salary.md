## DTO
package employeesalary

type CreateEmployeeSalaryRequest struct {
	EmployeeID    string `json:"employee_id" binding:"required"`
	BaseSalary    int    `json:"base_salary" binding:"required"`
	EffectiveDate string `json:"effective_date" binding:"required"`
}

type UpdateEmployeeSalaryRequest struct {
	EmployeeID    string `json:"employee_id" binding:"required"`
	BaseSalary    int    `json:"base_salary" binding:"required"`
	EffectiveDate string `json:"effective_date" binding:"required"`
}

type EmployeeSalaryResponse struct {
	ID            string `json:"id"`
	EmployeeID    string `json:"employee_id"`
	BaseSalary    int    `json:"base_salary"`
	EffectiveDate string `json:"effective_date"`
}




## Route
package employeesalary

import (
	"go-hris/internal/middleware"
	"go-hris/internal/rbac"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(
	r *gin.RouterGroup,
	handler *Handler,
	rbacService rbac.Service,
) {
	salaries := r.Group("/employee-salaries")
	salaries.Use(middleware.AuthMiddleware())
	{
		salaries.GET("", middleware.RBACAuthorize(rbacService, "salary", "read"), handler.GetAll)
		salaries.GET("/:id", middleware.RBACAuthorize(rbacService, "salary", "read"), handler.GetById)
		salaries.POST("", middleware.RBACAuthorize(rbacService, "salary", "update"), handler.Create)
		salaries.PUT("/:id", middleware.RBACAuthorize(rbacService, "salary", "update"), handler.Update)
		salaries.DELETE("/:id", middleware.RBACAuthorize(rbacService, "salary", "update"), handler.Delete)
	}
}


## Handler

func (h *Handler) Create(c *gin.Context) {
	companyID := c.GetString("company_id")
	var req CreateEmployeeSalaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Input tidak valid", err.Error())
		return
	}

	resp, err := h.service.Create(c.Request.Context(), companyID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, resp, nil)
}

func (h *Handler) GetAll(c *gin.Context) {
	ctx := c.Request.Context()
	companyID := c.GetString("company_id")

	resp, err := h.service.GetAll(ctx, companyID)
	if err != nil {
		if errors.Is(err, errors.New("forbidden")) {
			response.Error(c, http.StatusForbidden, "FORBIDDEN", "forbidden", nil)
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, resp, nil)
}

func (h *Handler) GetById(c *gin.Context) {
	ctx := c.Request.Context()
	targetID := c.Param("id")
	companyID := c.GetString("company_id")

	resp, err := h.service.GetByID(ctx, companyID, targetID)
	if err != nil {
		if errors.Is(err, errors.New("forbidden")) {
			response.Error(c, http.StatusForbidden, "FORBIDDEN", "forbidden", nil)
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, resp, nil)
}

func (h *Handler) Update(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	companyID := c.GetString("company_id")
	var req UpdateEmployeeSalaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Input tidak valid", err.Error())
		return
	}

	resp, err := h.service.Update(ctx, companyID, id, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, resp, nil)
}

func (h *Handler) Delete(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	companyID := c.GetString("company_id")

	if err := h.service.Delete(ctx, companyID, id); err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error(), nil)
		return
	}

	c.Status(http.StatusNoContent)
}