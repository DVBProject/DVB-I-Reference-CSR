module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "sofia",
    DB: "dvb_i_csr",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };