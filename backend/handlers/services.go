package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/MeitY/infosetu-backend/middleware"
	"github.com/MeitY/infosetu-backend/models"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func ListServices() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		services := []map[string]string{
			{"code": "PMK", "name": "PM-KISAN", "description": "Pradhan Mantri Kisan Samman Nidhi"},
			{"code": "PMAY", "name": "PM Awas Yojana", "description": "Housing for All"},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(services)
	}
}

func ApplyForService(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		citizenID := r.Context().Value(middleware.CitizenIDKey).(uuid.UUID)

		var req struct {
			ServiceCode string          `json:"service_code"`
			FormData    json.RawMessage `json:"form_data"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request", http.StatusBadRequest)
			return
		}

		appID, _ := models.NewApplicationID()
		arn := fmt.Sprintf("ARN-%s-%d", req.ServiceCode, appID.ID())

		_, err := db.Exec(r.Context(),
			"INSERT INTO applications (id, citizen_id, arn, service_code, status, form_data) VALUES ($1, $2, $3, $4, $5, $6)",
			appID, citizenID, arn, req.ServiceCode, "SUBMITTED", req.FormData)

		if err != nil {
			http.Error(w, "application submission failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"arn": arn, "status": "SUBMITTED"})
	}
}
