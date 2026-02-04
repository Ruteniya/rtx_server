# Automatic HTTP Request/Response Logging

This application automatically logs **all HTTP requests and responses** using a global interceptor. No manual logging code needed in controllers!

## What Gets Logged

For every endpoint call, the interceptor automatically logs:

### Request Logs
- HTTP method (GET, POST, PUT, DELETE, etc.)
- URL path
- Query parameters
- Route parameters
- Request body (with sensitive fields redacted)
- IP address
- User agent
- User ID (if authenticated)

### Response Logs
- HTTP status code
- Response duration (in milliseconds)
- Response size

### Error Logs
- Error status code
- Error name and message
- Stack trace (in development only)

## Example Log Output

```json
{
  "message": "Incoming POST /groups",
  "method": "POST",
  "url": "/groups",
  "body": { "name": "Team A", "numberOfParticipants": 5 },
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "userId": "user-uuid-here"
}

{
  "message": "Outgoing POST /groups 201",
  "method": "POST",
  "url": "/groups",
  "statusCode": 201,
  "duration": "45ms",
  "responseSize": 234
}
```

## Security

Sensitive fields in request bodies are automatically redacted:
- `password`
- `token`
- `secret`
- `authorization`
- `cookie`

These fields will appear as `[REDACTED]` in logs.

## Configuration

The interceptor is automatically enabled for all endpoints. No configuration needed!

To disable for specific routes, you can use NestJS route exclusions, but it's recommended to keep it enabled for better observability.

## Benefits

✅ **Zero manual work** - All endpoints logged automatically  
✅ **Consistent format** - All logs follow the same structure  
✅ **Performance tracking** - See response times for every request  
✅ **Error tracking** - Automatic error logging with context  
✅ **Security** - Sensitive data automatically redacted  
✅ **User tracking** - See which users are making requests  

## Log Levels

- **Info**: Successful requests and responses
- **Error**: Failed requests with error details

All logs go through Winston, so they appear in:
- Console (JSON in production, colored in development)
- Log files (if `LOG_DIRECTORY` is set)
