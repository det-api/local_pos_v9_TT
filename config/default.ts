export default {
  port: 9000,
  host: "localhost",
  dbUrl: "mongodb://lmo:asdffdsa@127.0.0.1:27017/local-pos?authSource=admin",
  saltWorkFactor: 10,
  secretKey: "suuhh",
  page_limit: 50,
  mqttUrl: "mqqt://127.0.0.1:1883",
  // mqttUrl: "ws://192.168.0.100:9001",

  mqttUserName: "detpos",
  mqttPassword: "asdffdsa",
  // serverUrl: "https://detfsmm.com",
  // detailsaleCloudUrl: "https://detfsmm.com/api/detail-sale",
  tankDataCloudUrl: "http://127.0.0.1:8080/baseOilcan.php",
  //
  //coustomerCloudUrl: "http://detfsmm.com:9000/api/customer",
  // coustomerCloudUrl: "https://detfsmm.com/api/customer/local-create",
  // debtCloudUrl: "https://detfsmm.com/api/debt/local-create",
};
