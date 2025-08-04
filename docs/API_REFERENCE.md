# Onboarding Flow API Reference

## Overview
This document outlines the API endpoints for the Partner Onboarding Flow in the Nyrkart Partner Portal.

## Base URL
All endpoints are relative to the base URL of the API.

## Authentication
All endpoints require authentication. Include the authentication token in the request headers.

## Endpoints

### 1. Initialize New Onboarding Session
Initialize a new onboarding session for the authenticated partner.

**Endpoint:** `POST /api/v1/onboard/init-session`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Session initialized successfully",
  "sessionId": "unique-session-id",
  "currentStep": 1,
  "expiresAt": "2025-08-11T19:26:20+05:30"
}
```

### 2. Save Business Information
Save business information for the current onboarding session.

**Endpoint:** `POST /api/v1/onboard/save-business-info`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "unique-session-id",
  "businessInfo": {
    "businessName": "Example Business",
    "businessType": "Retail",
    "panNumber": "ABCDE1234F",
    "address": "123 Business Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Business information saved successfully"
}
```

### 3. Upload Documents
Upload required documents for the onboarding process.

**Endpoint:** `POST /api/v1/onboard/upload-documents`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `sessionId`: (string) The session ID
- `panCard`: (file) Scanned copy of PAN card
- `aadhaarCard`: (file) Scanned copy of Aadhaar card
- `gstCertificate`: (file, optional) Scanned copy of GST certificate

**Response:**
```json
{
  "success": true,
  "message": "Documents uploaded successfully",
  "documents": {
    "panCard": "https://storage.example.com/pan_12345.jpg",
    "aadhaarCard": "https://storage.example.com/aadhaar_12345.jpg",
    "gstCertificate": "https://storage.example.com/gst_12345.jpg"
  }
}
```

### 4. Submit Onboarding for Review
Submit the completed onboarding application for review.

**Endpoint:** `POST /api/v1/onboard/submit`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "unique-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Onboarding submitted for review",
  "status": "under_review"
}
```

### 5. Check Onboarding Status
Check the current status of the onboarding process.

**Endpoint:** `GET /api/v1/onboard/status`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": "in_progress",
  "currentStep": 3,
  "expiresAt": "2025-08-11T19:26:20+05:30",
  "data": {
    "businessInfo": {
      "businessName": "Example Business",
      "businessType": "Retail",
      "status": "completed"
    },
    "documents": {
      "panCard": "uploaded",
      "aadhaarCard": "uploaded",
      "gstCertificate": "pending"
    },
    "verificationStatus": "pending"
  }
}
```

## Error Responses
All error responses follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

## Status Codes
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
