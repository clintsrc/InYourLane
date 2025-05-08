import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";
import { UserFactory } from "./user.js";
import { TicketFactory } from "./ticket.js";

const sequelize = process.env.DB_URL
  ? new Sequelize(process.env.DB_URL)
  : new Sequelize(
      process.env.DB_NAME || "",
      process.env.DB_USER || "",
      process.env.DB_PASSWORD,
      {
        host: "localhost",
        dialect: "postgres",
        dialectOptions: {
          decimalNumbers: true,
          /* Use SSL if required:
             Render's initial db doesn't require ssl, but
             if you want to isolate the app in a separate
             database, ssl is required */
          ssl: {
            // forces attempt to connect using ssl when required (for production)
            require: true,
            // allow self-signed cert for local testing, but should be improved for security!
            rejectUnauthorized: false,
          },
        },
      }
    );

const User = UserFactory(sequelize);
const Ticket = TicketFactory(sequelize);

User.hasMany(Ticket, { foreignKey: "assignedUserId" });
Ticket.belongsTo(User, { foreignKey: "assignedUserId", as: "assignedUser" });

export { sequelize, User, Ticket };
