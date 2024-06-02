const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

const getUser = async (email) => {
  const user = await dynamodb
    .query({
      TableName: "Users",
      KeyConditionExpression: "email = :e",
      ExpressionAttributeValues: {
        ":e": email,
      },
      IndexName: "EmailIndex",
    })
    .promise();

  return user.Items ? user.Items[0] : undefined;
};

const setUserLogged = (id) => {
  dynamodb.update({
    TableName: "TaskTable",
    Key: { id },
    UpdateExpression: "set logged = :l",
    ExpressionAttributeValues: {
      ":l": true,
    },
    ReturnValues: "ALL_NEW",
  });
};

const login = async (event) => {
  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return {
      status: 500,
      error: "missing attrs",
    };
  }

  const user = await getUser(email);
  const isCorrectPassword = await comparePassword(
    password,
    user?.password || ""
  );

  if (!user || !isCorrectPassword) {
    return {
      status: 400,
      message: "Wrong password or email",
    };
  }

  setUserLogged(user.id);
  delete user.password;

  return {
    statusCode: 200,
    body: JSON.stringify({ data: { logged: true, ...user } }),
  };
};

module.exports = {
  login,
};
