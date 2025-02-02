/*
 * Run the script to create the database:
 *    psql -U postgres -f db/schema.sql
 *
 * Connect to the database:
 * psql -U postgres
 * \l kanban_db
 * \c kanban_db
 *
 * List tables for troubleshooting:
 * \dt
 * \q
 *
 */

-- DROP DATABASE
DROP DATABASE IF EXISTS kanban_db;

-- CREATE DATABASE
CREATE DATABASE kanban_db;
