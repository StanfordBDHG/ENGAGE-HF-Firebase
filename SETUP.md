<!-- 
This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project 
SPDX-FileCopyrightText: 2023 Stanford University
SPDX-License-Identifier: MIT 
-->

# ENGAGE-HF Firebase Setup Guide

This guide provides step-by-step instructions for setting up the ENGAGE-HF Firebase infrastructure from scratch, including service account configuration, initial deployment, and onboarding the first clinicians and patients.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Firebase Project Setup](#firebase-project-setup)
- [Service Accounts](#service-accounts)
- [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Initial Data Seeding](#initial-data-seeding)
- [Onboarding First Users](#onboarding-first-users)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up ENGAGE-HF Firebase, ensure you have the following:

- **Node.js**: Version 22 (required by the project)
- **npm**: Latest version compatible with Node.js 22
- **Firebase CLI**: Install globally with `npm install -g firebase-tools`
- **Google Cloud Project**: A Google Cloud Platform (GCP) project with billing enabled
- **Git**: For version control
- **Docker** (optional): For running emulators in containerized environment

## Firebase Project Setup

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., `your-org-engage-hf`)
4. Enable Google Analytics (recommended)
5. Complete the project creation

### 2. Enable Required Firebase Services

In your Firebase project, enable the following services:

#### Authentication
1. Navigate to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: For patient accounts
   - **Phone**: For patient phone verification (requires Twilio configuration)
   - **OpenID Connect (OIDC)**: For clinician/admin Single Sign-On (SSO)
     - Configure provider for your institution (see [SSO Setup](#sso-setup))

#### Firestore Database
1. Navigate to **Firestore Database**
2. Click "Create database"
3. Choose production mode or test mode (use production mode for production deployments)
4. Select a region close to your users (e.g., `us-central1`)

#### Cloud Storage
1. Navigate to **Storage**
2. Click "Get started"
3. Use default security rules for now (will be deployed with project)
4. Choose the same region as Firestore

#### Cloud Functions
Cloud Functions will be automatically configured during deployment.

### 3. Configure Firebase Project ID

Update the `.firebaserc` file in the repository root with your project ID:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

## Service Accounts

ENGAGE-HF uses two service accounts with different permission levels for security and operational separation:

### Privileged Service Account

**Email Format**: `cloudfunctionsserviceaccount@[PROJECT_ID].iam.gserviceaccount.com`

**Purpose**: Handles sensitive operations that require elevated permissions.

**Used By**:
- `defaultSeed` - Seeding initial data
- `customSeed` - Custom data seeding
- `updateStaticData` - Updating static reference data
- `deleteUser` - User account deletion
- `enrollUser` - User enrollment with invitation codes
- `getUsersInformation` - Retrieving user information
- `onSchedule` functions - Scheduled background tasks
- `phoneNumber` functions - Phone number management
- `enableUser`/`disableUser` - User account management
- `shareHealthSummary` - Sharing health summaries
- `updateUserInformation` - Updating user data
- Identity Platform blocking functions

**Required Permissions**:
This service account needs the following IAM roles:
- **Firebase Admin SDK Administrator Service Agent** - For full Firebase access
- **Cloud Datastore User** - For Firestore operations
- **Firebase Authentication Admin** - For user management
- **Cloud Functions Invoker** - For function invocation
- **Service Account Token Creator** - For token generation

### Default Service Account

**Email Format**: `limited-cloudfunction-sa@[PROJECT_ID].iam.gserviceaccount.com`

**Purpose**: Handles standard operations with minimal required permissions.

**Used By**:
- All other Cloud Functions not requiring elevated permissions
- Standard HTTP and callable functions
- Client-initiated operations

**Required Permissions**:
- **Cloud Functions Invoker** - For function invocation
- **Cloud Datastore User** - For Firestore read/write
- Basic Firebase access

### Setting Up Service Accounts

#### 1. Create Service Accounts

The privileged service account (`cloudfunctionsserviceaccount@...`) is typically created automatically by Firebase/GCP. The default service account needs to be created manually:

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Create the limited service account
gcloud iam service-accounts create limited-cloudfunction-sa \
    --display-name="Limited Cloud Functions Service Account" \
    --project=$PROJECT_ID
```

#### 2. Assign IAM Roles

Assign necessary roles to the limited service account:

```bash
# Cloud Functions Invoker
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:limited-cloudfunction-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudfunctions.invoker"

# Cloud Datastore User
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:limited-cloudfunction-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/datastore.user"
```

For the privileged service account, ensure it has the required elevated permissions:

```bash
# Service Account Token Creator
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cloudfunctionsserviceaccount@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountTokenCreator"

# Firebase Authentication Admin (if not already assigned)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:cloudfunctionsserviceaccount@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/firebaseauth.admin"
```

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/StanfordBDHG/ENGAGE-HF-Firebase.git
cd ENGAGE-HF-Firebase
```

### 2. Install Dependencies

```bash
# Install dependencies for both packages (models and functions)
npm run install
```

### 3. Build the Project

```bash
# Build both packages
npm run build
```

Alternatively, use the combined command:

```bash
npm run prepare
```

This command combines cleaning, installing dependencies, and building.

### 4. Firebase Login

```bash
# Login to Firebase
firebase login

# Set the active project
firebase use --add
# Select your project from the list
```

## Configuration

### Environment Variables and Secrets

ENGAGE-HF uses Firebase Secret Manager for sensitive configuration. Set up the following secrets:

#### Required Secrets

##### 1. Twilio Configuration (for SMS/Phone Verification)

Create a Twilio account and obtain the required credentials:

```bash
firebase functions:secrets:set TWILIO_PHONE_NUMBER
# Enter your Twilio phone number (E.164 format, e.g., +15551234567)

firebase functions:secrets:set TWILIO_ACCOUNT_SID
# Enter your Twilio Account SID

firebase functions:secrets:set TWILIO_API_KEY
# Enter your Twilio API Key

firebase functions:secrets:set TWILIO_API_SECRET
# Enter your Twilio API Secret

firebase functions:secrets:set TWILIO_VERIFY_SERVICE_ID
# Enter your Twilio Verify Service ID
```

##### 2. Web Frontend Base URL

```bash
firebase functions:secrets:set WEB_FRONTEND_BASE_URL
# Enter your web dashboard URL (e.g., https://dashboard.yourdomain.com)
```

### SSO Setup

Configure Single Sign-On for clinicians and administrators. See the main [README.md](README.md#single-sign-on-sso-setup) for detailed SSO configuration instructions.

#### Quick Overview:

1. Configure OIDC with your institution's identity provider
2. Add the provider to Firebase Authentication
3. Update `functions/data/organizations.json` with your organization details:

```json
{
  "your-org-id": {
    "name": "Your Organization Name",
    "contactName": "Contact Person",
    "phoneNumber": "+1 (555) 123-4567",
    "emailAddress": "contact@yourdomain.edu",
    "ssoProviderId": "oidc.yourprovider"
  }
}
```

## Deployment

### First-Time Deployment

1. **Deploy Firestore Rules and Indexes**:
   ```bash
   firebase deploy --only firestore
   ```

2. **Deploy Storage Rules**:
   ```bash
   firebase deploy --only storage
   ```

3. **Deploy Cloud Functions**:
   ```bash
   firebase deploy --only functions
   ```

   Or deploy all at once:
   ```bash
   firebase deploy
   ```

### Continuous Deployment

The repository includes GitHub Actions workflows for automated deployment:

- **Staging**: Automatically deploys on push to `main` branch
- **Production**: Manually triggered via workflow dispatch

Configure the following in your GitHub repository settings:

1. **Environment Variables** (per environment):
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID

2. **Secrets**:
   - `GOOGLE_APPLICATION_CREDENTIALS_BASE64`: Base64-encoded service account key

To create the credentials secret:
```bash
# Download service account key from Firebase Console
# Project Settings → Service Accounts → Generate New Private Key

# Encode to base64
cat serviceAccountKey.json | base64 > serviceAccountKey.base64.txt

# Add the contents to GitHub Secrets
```

## Initial Data Seeding

After deployment, seed the database with initial static data and create the first admin user.

### 1. Seed Static Data

Static data includes medications, questionnaires, video sections, and organizations.

#### Option A: Using Firebase Emulator (Development)

```bash
# Start emulators with seeding
npm run serve:seeded
```

This will:
- Start Firebase emulators (Auth, Firestore, Functions, Storage)
- Automatically seed static data and demo users
- Keep emulators running for development

#### Option B: Using Production Deployment

Call the `updateStaticData` function to seed static reference data:

```bash
# Using Firebase CLI
firebase functions:call updateStaticData --data '{}'
```

Or use the `defaultSeed` function (admin-only) via the web dashboard or a client app after authenticating as an admin.

### 2. Create Organizations

Organizations define the institutions using ENGAGE-HF. Update `functions/data/organizations.json` before deployment with your organization(s):

```json
{
  "org-id": {
    "name": "Organization Name",
    "contactName": "Primary Contact",
    "phoneNumber": "+1 (555) 123-4567",
    "emailAddress": "contact@organization.edu",
    "ssoProviderId": "oidc.provider-id"
  }
}
```

## Onboarding First Users

### 1. Create Admin User

Admin users have the highest level of access and can create other users.

#### Method A: Manual Creation via Firestore and Authentication

1. **Create Authentication User** (Firebase Console → Authentication):
   - Email: `admin@yourdomain.edu`
   - Set a secure password
   - Note the User ID (UID)

2. **Create User Document** (Firestore Console):
   - Collection: `users`
   - Document ID: [User ID from step 1]
   - Document data:
     ```json
     {
       "type": "admin",
       "dateOfEnrollment": "[Current ISO 8601 timestamp]",
       "lastActiveDate": "[Current ISO 8601 timestamp]",
       "invitationCode": "admin@yourdomain.edu"
     }
     ```

3. **Set Custom Claims** (using Firebase CLI or Admin SDK):
   ```bash
   firebase functions:call updateUserInformation --data '{
     "userId": "[USER_ID]",
     "claims": {
       "type": "admin",
       "disabled": false
     }
   }'
   ```

#### Method B: Using Invitation System

1. **Create Invitation Document** (Firestore Console):
   - Collection: `invitations`
   - Document ID: Auto-generate or use custom ID
   - Document data:
     ```json
     {
       "code": "ADMIN001",
       "auth": {
         "displayName": "System Administrator",
         "email": "admin@yourdomain.edu"
       },
       "user": {
         "type": "admin"
       }
     }
     ```

2. **Use Invitation Code** in the web dashboard or mobile app during first login.

### 2. Create Organization Owners

Organization owners manage their specific organization and can create clinicians.

1. **Use Web Dashboard** (as admin):
   - Navigate to Users → Create Invitation
   - Select type: "Owner"
   - Enter email address (must match SSO email)
   - Select organization
   - Generate invitation code

2. **Owner Logs In**:
   - Owner visits web dashboard
   - Authenticates via SSO
   - System automatically enrolls them using the invitation

### 3. Create Clinicians

Clinicians manage patients within their organization.

1. **Use Web Dashboard** (as admin or owner):
   - Navigate to Users → Create Invitation
   - Select type: "Clinician"
   - Enter email address (must match SSO email)
   - Select organization
   - Generate invitation code

2. **Clinician Logs In**:
   - Same SSO process as owners

### 4. Onboard Patients

Patients are onboarded through a different process:

1. **Create Patient Invitation** (Web Dashboard):
   - Navigate to Patients → Create Invitation
   - Enter patient details:
     - Display name
     - Date of birth
     - Assigned clinician
     - Organization
   - Generate 8-character invitation code

2. **Patient Setup**:
   - Patient downloads mobile app
   - Enters invitation code
   - Creates account with email/password
   - Completes consent process
   - Begins using the app

## Testing

### Local Testing with Emulators

```bash
# Run tests with emulators
npm run test:ci
```

This command:
- Starts Firebase emulators (Auth, Firestore, Storage)
- Runs all Jest tests
- Generates test coverage report
- Shuts down emulators

### Manual Testing

1. **Start Emulators**:
   ```bash
   npm run serve:seeded
   ```

2. **Access Emulator UI**:
   - Open browser to `http://localhost:4000`
   - View Authentication, Firestore, Storage, and Functions

3. **Test Functions**:
   - Use emulator UI to trigger functions
   - Check logs in terminal
   - Inspect Firestore data changes

### Testing Individual Functions

You can test functions directly using curl or the Firebase CLI:

```bash
# Example: Test defaultSeed function
curl --location "http://localhost:5001/[PROJECT_ID]/us-central1/defaultSeed" \
  --header "Content-Type: application/json" \
  --data '{"staticData": {}}'
```

## Troubleshooting

### Common Issues

#### 1. Build Errors with TypeScript

**Error**: `Cannot find global type 'Array'` or similar TypeScript errors

**Solution**: 
- Ensure Node.js version 22 is installed
- Run `npm run install` to reinstall dependencies
- Clear build artifacts: `npm run clean`
- Rebuild: `npm run build`

#### 2. Service Account Permission Errors

**Error**: `Permission denied` or `Insufficient permissions`

**Solution**:
- Verify service account exists: 
  ```bash
  gcloud iam service-accounts list --project=[PROJECT_ID]
  ```
- Check IAM roles are properly assigned (see [Service Accounts](#service-accounts))
- Ensure the correct service account is specified in function options

#### 3. Secrets Not Found

**Error**: `Secret not found: TWILIO_PHONE_NUMBER`

**Solution**:
- Verify secrets are set:
  ```bash
  firebase functions:secrets:access TWILIO_PHONE_NUMBER
  ```
- Set missing secrets using the commands in [Configuration](#configuration)
- Redeploy functions after setting secrets

#### 4. Emulator Connection Issues

**Error**: Emulators fail to start or connect

**Solution**:
- Check ports 4000, 5001, 8080, 9099, 9199 are available
- Stop any running emulator processes
- Try using Docker: `docker-compose up`
- Check firewall settings

#### 5. Function Deployment Failures

**Error**: Functions fail to deploy

**Solution**:
- Verify Firebase project is selected: `firebase use`
- Check Node.js version matches requirement (v22)
- Ensure all secrets are configured
- Check deployment logs: `firebase functions:log`
- Verify IAM permissions for deployment service account

### Getting Help

- **Documentation**: Review the main [README.md](README.md) for detailed feature documentation
- **Issues**: Check [GitHub Issues](https://github.com/StanfordBDHG/ENGAGE-HF-Firebase/issues) for known problems
- **Discussions**: Use [GitHub Discussions](https://github.com/StanfordBDHG/ENGAGE-HF-Firebase/discussions) for questions
- **Contributing**: See [CONTRIBUTORS.md](CONTRIBUTORS.md) for contribution guidelines

## Next Steps

After completing the setup:

1. **Review Security Rules**: Customize Firestore and Storage rules for your deployment
2. **Configure Monitoring**: Set up Firebase Performance Monitoring and Crashlytics
3. **Backup Strategy**: Implement Firestore backup procedures
4. **Documentation**: Document your organization-specific configurations and procedures
5. **Training**: Train clinicians and staff on the web dashboard
6. **Patient Materials**: Prepare patient onboarding materials and invitation codes

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud IAM Documentation](https://cloud.google.com/iam/docs)
- [Twilio Documentation](https://www.twilio.com/docs)
- [ENGAGE-HF Main Repository](https://github.com/StanfordBDHG/ENGAGE-HF-Firebase)
