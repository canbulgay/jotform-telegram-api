# Jotform Telegram Api

## Table of Contents

- [About](#about)
- [Dependencies](#dependencies)
- [Installing](#getting_started)
- [Usage](#usage)
- [Api Documentation](#api)

## 💭 About <a name = "about"></a>

Jotform telegram api takes your telegram user information from you and communicates with jotform api and sends the form you have chosen to the recipient you choose. The recipient connects to the telegram bot we created before. The user can see the forms assigned to him and answer and submit these forms.

## 📚 Dependencies <a name = "dependencies"></a>

- axios
- cookie-parser
- dotenv
- express
- helmet
- mongoose
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api/)
- [Gramjs](github.com/gram-js/gramjs)
- chai
- mocha
- nodemon
- sinon

## 📦 Installing <a name = "getting_started"></a>

- Clone the git repository: `git clone https://github.com/canbulgay/jotform-telegram-api`
- Modify the `.env` file configure your database settings.
- Install project dependencies with `npm install`
- Run the program `npm start`

## 🚀 Usage <a name = "usage"></a>

When you have finished all the installations, you need to create a telegram client first.

Sign up for Telegram using any application.
Log in to your Telegram core: https://my.telegram.org
Go to ‘API development tools’, save your api_key and api_hash values for a api requests.

The purpose of the logic here is to prepare a flow that will hold the form and message values and create an action button and send these values to a recipient via the telegram client.

When the button is pressed and a message is sent to the recipient, the selected forms and questions are registered in the db. There is a bot link in the message sent to the recipient, and when the recipient enters this bot, he can fill out the form and submit.

## 📚 API Documentation <a name = "api"></a>

### Create Client Description and API Endpoints

`Base URL: "YOUR_LOCALHOST_URL"/api/telegram-client`

### Set client credentials

    	POST				/set-client-credentials

**_Body Form-Data Parameters_**

| Key      | Type   | Value                            |
| -------- | ------ | -------------------------------- |
| api_key  | number | 12508635                         |
| api_hash | email  | 3ad8e51611b17fac5a96b22dcf14b398 |

Example: `{Base URL}/set-client-credentials`

```json
{
  "message": "Your credentials has been saved."
}
```

### Send Code To Phone Number

    	POST				/send-code

**_Body Form-Data Parameters_**

| Key          | Type   | Value        |
| ------------ | ------ | ------------ |
| phone_number | string | 905234567676 |

Example: `{Base URL}/send-code`

```json
{
  "message": "Your code sent to your phone.",
  "phoneCodeHash": "3523f0407d1bea4f39" //This field will be needed for sign in
}
```

### Sign In the Client

    	POST				/sign-in

**_Body Form-Data Parameters_**

| Key             | Type   | Value              |
| --------------- | ------ | ------------------ |
| phone_code      | number | 961566             |
| phone_code_hash | string | 3523f0407d1bea4f39 |

Example: `{Base URL}/sign-in`

```json
{
        "messsage": "You are logged in.",
        "user": {
            "_id": "630f4c7451b237b554a9sd8604"
            "api_key": 1496132319
            "api_hash": "81751fa59abbadsad984e799b38d408973960"
            "session_string": "1BAAOMTQ5LjE1NC4xNjcuOTasdaEAUF6VCYeBhdudsadaJBZoYjOCP0FpiS+mlRywmysBPyVGk7itzw…"
            "createdAt": "2022-08-31T11:56:36.088+00:00"
            "updatedAt": "2022-09-03T12:39:36.341+00:00"
            "phone_number": "905312665079"
            "first_name": "Can"
            "last_name": "Bulgay"
            "username": "canbulgay"
        }
}
```

### Create Send Telegram Button

    	POST				/:userId/create-button

**_Body Form-Data Parameters_**

| Key       | Type   | Value                                              |
| --------- | ------ | -------------------------------------------------- |
| form_id   | string | 222492458516057                                    |
| column_id | string | 6                                                  |
| sheet_id  | string | 222092123377047                                    |
| message   | string | You are expected to fill out the "Internship Form. |

Example: `{Base URL}/:userId/create-button`

```json
{
  "message": "Your button has been created."
}
```

### Send Message

    	POST				/:userId/send-message

**_Body Form-Data Parameters_**

| Key       | Type   | Value           |
| --------- | ------ | --------------- |
| username  | string | canbulgay       |
| column_id | string | 6               |
| sheet_id  | string | 222092123377047 |

Example: `{Base URL}/:userId/send-message`

```json
{
  "message": "Your message was sent successfully",
  "payload": {
    "username": "canbulgay",
    "message": "You are expected to fill out the 'Internship Form'"
  }
}
```
