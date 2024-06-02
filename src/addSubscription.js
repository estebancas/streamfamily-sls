const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

const addSubscription = async (event) => {
  const { name, price, logo = "", paymentDate, owner = "", subscribers = [] } = JSON.parse(event.body);

  if (!name || !price || !paymentDate) {
    return {
      status: 500,
      error: "missing attrs",
    };
  }

  const id = uuidv4();

  const subscription = {
    id,
    name,
    price,
    logo,
    owner,
    subscribers,
  };

  await dynamodb
    .put({
      TableName: "Subscriptions",
      Item: subscription,
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ data: subscription }),
  };
};

module.exports = { addSubscription };
