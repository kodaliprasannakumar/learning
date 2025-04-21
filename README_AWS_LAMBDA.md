# AWS Lambda Generate-Media Function

This AWS Lambda function replaces the Supabase Edge Function for generating media (images, videos, and text) based on children's doodles using OpenAI APIs.

## Prerequisites

- AWS Account
- AWS CLI configured locally
- Python 3.9+ (for local development)
- OpenAI API Key

## Deployment Steps

### 1. Prepare the Lambda Package

1. Create a deployment package directory:
   ```bash
   mkdir deployment-package
   cd deployment-package
   ```

2. Install dependencies into the package directory:
   ```bash
   pip install -r requirements.txt --target .
   ```

3. Copy the lambda function code:
   ```bash
   cp ../lambda_function.py .
   ```

4. Create a zip file:
   ```bash
   zip -r ../generate-media-lambda.zip .
   ```

### 2. Create the Lambda Function in AWS

1. Navigate to AWS Lambda in the AWS Management Console
2. Click "Create function"
3. Choose "Author from scratch"
4. Enter function name: `generate-media`
5. Runtime: Python 3.9
6. Architecture: x86_64
7. Click "Create function"

### 3. Upload the Deployment Package

1. In the Function code section, click "Upload from" and select ".zip file"
2. Upload the `generate-media-lambda.zip` file
3. Click "Save"

### 4. Configure Environment Variables

1. In the Configuration tab, click "Environment variables"
2. Click "Edit"
3. Add the following key-value pair:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
4. Click "Save"

### 5. Configure API Gateway Trigger

1. Click "Add trigger" in the Function overview
2. Select "API Gateway" as the source
3. Create a new API:
   - API type: HTTP API
   - Security: Open
4. Click "Add"

### 6. Configure Lambda Function Settings

1. Under "Configuration" > "General configuration", set:
   - Memory: 256 MB (increase if needed)
   - Timeout: 30 seconds (increase if needed, especially for video generation)

### 7. Configure CORS (if needed)

1. Navigate to the API Gateway console
2. Select the API created for your Lambda function
3. Go to CORS configuration and add appropriate CORS headers:
   - Allow origins: `*` (or your specific domain)
   - Allow methods: `GET, POST, OPTIONS`
   - Allow headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`

## Updating Your Frontend Code

Update your frontend code to use the new Lambda function's API Gateway endpoint instead of the Supabase function:

```javascript
// Previous Supabase code:
const { data, error } = await supabase.functions.invoke('generate-media', {
  body: {
    doodleImage: aiImage || doodleImage,
    mode: 'video',
    style: selectedStyle,
    prompt: doodleDescription
  }
});

// New AWS Lambda code:
const response = await fetch('https://kxjju6abc5.execute-api.us-west-2.amazonaws.com/default/generate-media', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    doodleImage: aiImage || doodleImage,
    mode: 'video',
    style: selectedStyle,
    prompt: doodleDescription
  })
});
const data = await response.json();
```

## Notes

- The function is set up to handle CORS preflight requests
- Increase Lambda timeout and memory settings if you experience timeouts with image or video generation
- For better security, consider using AWS Lambda environment variables, Secret Manager, or Parameter Store for sensitive values
- Monitor Lambda usage to optimize costs
- Consider using AWS CloudWatch for logging and monitoring 