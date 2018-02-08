# user-service

A microservice for handling user account actions in the CLARK platform.

## Routes

### /users

| Request Type | Request Body | Type | Description |
| --- | --- | --- | --- |
| GET |  |  |  |
| POST | `email` | `string` | User's email address |

| Response Body | Type | Description |
| --- | --- | --- |
| GET |  |  |
| "Welcome to the Users API" | `string` | Welcome message |
| POST |  |  |
| "Invalid registration credentials" | `string` | If invalid or empty credentials are provided, an error is returned |

### /users/tokens

| Request Type | Request Body | Type | Description |
| --- | --- | --- | --- |
| DELETE |  |  |  |
| POST | `username` | `string` | User's username |
|  | `pwd` | `string` | User's password |

| Response Body | Type | Description |
| --- | --- | --- |
| DELETE |  |  |
| "Cannot delete user accounts at this time" | `string` | Error message; unhandled promise rejection. |
| POST |  |  |
| "Invalid username or password" | `string` | Error message |

### /users/:username

| Request Type | Request Body | Type | Description |
| --- | --- | --- | --- |
| GET |  |  |  |

| Response Body | Type | Description |
| --- | --- | --- |
| GET |  |  |
| "Welcome to the Users API" | `string` | Welcome message |
| POST |  |  |
| "Welcome to the Users API" | `string` | Error message |
