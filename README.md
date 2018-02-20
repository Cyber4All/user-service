# user-service

A microservice for handling user account actions in the CLARK platform.

## Routes

### `POST /users` - Register a new account
Request | []() | []()
---|---|---
`username` | `string` | user's unique account name
`firstname` | `string` | user's first name
`lastname`| `string` | user's last name
`email` | `string` | user's unique email
`organization` | `string` | user's affiliated organization
`objects` | object | contains two strings - the user's password, and the confirmation of that password

#### On Success
Response | []() | []()
---|---|---
`_username` | `string` | user's unique account name
`_firstname` | `string` | user's first name
`_lastname`| `string` | user's last name
`_email` | `string` | user's unique email
`_organization` | `string` | user's affiliated organization
`_objects` | object | contains two strings - the user's password, and the confirmation of that password


#### On Error
status | body | statusText
---|---|---
| "Invalid registration credentials" | `string` | If invalid or empty credentials are provided, an error is returned |

### `POST /users/tokens` - Create a new token for a user (log in)
Request | []() | []()
---|---|---
`username` | `string` | user's unique name
`password` | `string`|user's password

#### On Success
Response | []() | []()
---|---|---
`_username` | `string` | user's unique username
`_name` | `string` | user's first and last name (concatenated)
`_email` | `string` | user's unique email address
`_objects` | [LearningObject[]](https://github.com/Cyber4All/clark-entity#LearningObject) | user's learning objects
`token` | `string` | user's access token

#### On Error
status | body | statusText
---|---|---
`400` | `{ message: "Invalid username or password" }` | `Bad Request`

### `DELETE /users/tokens` - Delete a user account (todo)
Request | []() | []()
---|---|---
| |

#### On Success
Response | []() | []()
---|---|---
| | 

#### On Error
status | body | statusText
---|---|---
`400` | `Cannot delete user accounts at this time` | `Bad Request`

### `DELETE /users/:username` 

#### On Error
status | body | statusText
---|---|---
`400` | `Cannnot delete user accounts at this time` | `Bad Request`

### `POST /users/:username/tokens` - Validate tokens (login)
Request | []() | []()
---|---|---
`token` | `string` | user's access token

### On Success
status | body | statusText
---|---|---
`200` | `OK` | `OK`

#### On Error
status | body | statusText
---|---|---
`401` | `Invalid access token` | `Unauthorized`

### `DELETE /users/:username/tokens` - Delete tokens (logout)
status | body | statusText
---|---|---
`Error` | `Cannot log out at this time` |
