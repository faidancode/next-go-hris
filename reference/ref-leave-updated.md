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
	EmployeeID string  `json:"employee_id" binding:"required,uuid"`
	LeaveType  string  `json:"leave_type" binding:"required,oneof=ANNUAL SICK UNPAID"`
	StartDate  string  `json:"start_date" binding:"required"`
	EndDate    string  `json:"end_date" binding:"required"`
	Reason     string  `json:"reason"`
	Status     string  `json:"status" binding:"required,oneof=PENDING SUBMITTED APPROVED REJECTED CANCELLED"`
	ApprovedBy *string `json:"approved_by"`
	RejectionReason *string `json:"rejection_reason"`
}

type RejectLeaveRequest struct {
	RejectionReason string `json:"rejection_reason" binding:"required"`
}

type LeaveResponse struct {
	ID              string  `json:"id"`
	CompanyID       string  `json:"company_id"`
	EmployeeID      string  `json:"employee_id"`
	EmployeeName    string  `json:"employee_name"`
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

## Route
package leave

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
	leaves := r.Group("/leaves")
	leaves.Use(middleware.AuthMiddleware())
	{
		leaves.GET("", middleware.RBACAuthorize(rbacService, "leave", "read"), handler.GetAll)
		leaves.GET("/:id", middleware.RBACAuthorize(rbacService, "leave", "read"), handler.GetById)
		leaves.POST("", middleware.RBACAuthorize(rbacService, "leave", "create"), handler.Create)
		leaves.PUT("/:id", middleware.RBACAuthorize(rbacService, "leave", "create"), handler.Update)
		leaves.POST("/:id/submit", middleware.RBACAuthorize(rbacService, "leave", "create"), handler.Submit)
		leaves.POST("/:id/approve", middleware.RBACAuthorize(rbacService, "leave", "approve"), handler.Approve)
		leaves.POST("/:id/reject", middleware.RBACAuthorize(rbacService, "leave", "approve"), handler.Reject)
		leaves.DELETE("/:id", middleware.RBACAuthorize(rbacService, "leave", "approve"), handler.Delete)
	}
}


## Status Constants
const (
	StatusPending   = "PENDING"
	StatusSubmitted = "SUBMITTED"
	StatusApproved  = "APPROVED"
	StatusRejected  = "REJECTED"
	StatusCanceled  = "CANCELLED"
)