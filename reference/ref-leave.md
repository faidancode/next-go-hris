## DTO 
package leave

type CreateLeaveRequest struct {
	EmployeeID string `json:"employee_id" binding:"required,uuid"`
	LeaveType  string `json:"leave_type" binding:"required,oneof=ANNUAL SICK UNPAID"`
	StartDate  string `json:"start_date" binding:"required"`
	EndDate    string `json:"end_date" binding:"required"`
	Reason     string `json:"reason"`
}

type UpdateLeaveRequest struct {
	EmployeeID      string  `json:"employee_id" binding:"required,uuid"`
	LeaveType       string  `json:"leave_type" binding:"required,oneof=ANNUAL SICK UNPAID"`
	StartDate       string  `json:"start_date" binding:"required"`
	EndDate         string  `json:"end_date" binding:"required"`
	Reason          string  `json:"reason"`
	Status          string  `json:"status" binding:"required,oneof=PENDING APPROVED REJECTED CANCELLED"`
	ApprovedBy      *string `json:"approved_by"`
	RejectionReason *string `json:"rejection_reason"`
}

type LeaveResponse struct {
	ID              string  `json:"id"`
	CompanyID       string  `json:"company_id"`
	EmployeeID      string  `json:"employee_id"`
	LeaveType       string  `json:"leave_type"`
	StartDate       string  `json:"start_date"`
	EndDate         string  `json:"end_date"`
	TotalDays       int     `json:"total_days"`
	Reason          string  `json:"reason"`
	Status          string  `json:"status"`
	CreatedBy       string  `json:"created_by"`
	ApprovedBy      *string `json:"approved_by,omitempty"`
	ApprovedAt      *string `json:"approved_at,omitempty"`
	RejectionReason *string `json:"rejection_reason,omitempty"`
}


## Routes
func RegisterRoutes(
	r *gin.RouterGroup,
	handler *Handler,
	rbacService rbac.Service,
) {
	leaves := r.Group("/leaves")
	leaves.Use(middleware.AuthMiddleware())
	{
		leaves.GET("", middleware.RBACAuthorize(rbacService, "leave", "read"), handler.GetAll)
		leaves.GET("/:id", middleware.RBACAuthorize(rbacService, "leave", "read"), handler.GetById)
		leaves.POST("", middleware.RBACAuthorize(rbacService, "leave", "create"), handler.Create)
		leaves.PUT("/:id", middleware.RBACAuthorize(rbacService, "leave", "approve"), handler.Update)
		leaves.DELETE("/:id", middleware.RBACAuthorize(rbacService, "leave", "approve"), handler.Delete)
	}
}


## Handler
package leave

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Create(c *gin.Context) {
	companyID := c.GetString("company_id")
	actorID := c.GetString("employee_id")
	if actorID == "" {
		actorID = c.GetString("user_id_validated")
	}

	var req CreateLeaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.service.Create(c.Request.Context(), companyID, actorID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) GetAll(c *gin.Context) {
	ctx := c.Request.Context()
	companyID := c.GetString("company_id")

	resp, err := h.service.GetAll(ctx, companyID)
	if err != nil {
		if errors.Is(err, errors.New("forbidden")) {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) GetById(c *gin.Context) {
	ctx := c.Request.Context()
	targetID := c.Param("id")
	companyID := c.GetString("company_id")

	resp, err := h.service.GetByID(ctx, companyID, targetID)
	if err != nil {
		if errors.Is(err, errors.New("forbidden")) {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) Update(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	companyID := c.GetString("company_id")
	actorID := c.GetString("employee_id")
	if actorID == "" {
		actorID = c.GetString("user_id_validated")
	}

	var req UpdateLeaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.service.Update(ctx, companyID, actorID, id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) Delete(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	companyID := c.GetString("company_id")

	if err := h.service.Delete(ctx, companyID, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

