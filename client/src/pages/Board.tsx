import { useEffect, useState, useLayoutEffect } from "react";
import { Link } from "react-router-dom";

import { retrieveTickets, deleteTicket } from "../api/ticketAPI";
import ErrorPage from "./ErrorPage";
import Swimlane from "../components/Swimlane";
import { TicketData } from "../interfaces/TicketData";
import { ApiMessage } from "../interfaces/ApiMessage";

import auth from "../utils/auth";

const boardStates = ["Todo", "In Progress", "Done"];

const Board = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);
  const [error, setError] = useState(false);
  const [loginCheck, setLoginCheck] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const checkLogin = () => {
    if (auth.loggedIn()) {
      setLoginCheck(true);
    }
  };

  const fetchTickets = async () => {
    try {
      const data = await retrieveTickets();
      setTickets(data);
      setFilteredTickets(data);
    } catch (err) {
      console.error("Failed to retrieve tickets:", err);
      setError(true);
    }
  };

  const deleteIndvTicket = async (ticketId: number): Promise<ApiMessage> => {
    try {
      const data = await deleteTicket(ticketId);
      fetchTickets();
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  };

  /*
   * Get the Users to display in the filter list:
   * Retrieve the usernames from the tickets into a string array
   * Use Set to extract only the unique values in a new array object that gets returned
   *
   */
  const getUniqueUsernames = (): string[] => {
    // Get usernames and filter out any potentially undefined
    const usernames: string[] = tickets
      .map((ticket) => ticket.assignedUser?.username)
      .filter((username): username is string => Boolean(username));
    // Set() removes duplicates
    const uniqueUsernames = [...new Set(usernames)];
    return uniqueUsernames;
  };

  /*
   * Update the tickets when the user selects an item in the filter dropdown
   *
   */
  const handleUserFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Get selected username
    const selectedUsername = e.target.value;
    // Update the state
    setSelectedUser(selectedUsername);

    if (selectedUsername) {
      /* filter the user array to contain ticket records that have an assigned user matching the 
       the matching selected user */
      const filtered = tickets.filter(
        (ticket) =>
          ticket.assignedUser &&
          ticket.assignedUser.username === selectedUsername
      );
      // update the state with the tickets stored in the filtered array
      setFilteredTickets(filtered);
    } else {
      // Show all tickets if no user is selected ("All Users")
      setFilteredTickets(tickets);
    }
  };

  /* Sort the tickets by user
     ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description */
  const sortTicketsByUser = (ticketsToSort: TicketData[]): TicketData[] => {
    return ticketsToSort.sort((a, b) => {
      const userA = a.assignedUser?.username || "";
      const userB = b.assignedUser?.username || "";
      if (sortDirection === "asc") {
        return userA.localeCompare(userB); // ascending
      } else {
        return userB.localeCompare(userA); // descending
      }
    });
  };

  // Update the state with the selected sort order ascending/descending
  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortDirection = e.target.value as "asc" | "desc";
    setSortDirection(newSortDirection);
  };

  useLayoutEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    if (loginCheck) {
      fetchTickets();
    }
  }, [loginCheck]);

  if (error) {
    return <ErrorPage />;
  }

  return (
    <>
      {!loginCheck ? (
        <div className="login-notice">
          <h1>Login to create & view tickets</h1>
        </div>
      ) : (
        <div className="board">
          <Link to="/create">
            <button type="button" id="create-ticket-link">
              New Ticket
            </button>
          </Link>

          <div>
            <label className="filter-label" htmlFor="userFilter">
              Assigned to
            </label>
            <select
              id="userFilter"
              value={selectedUser}
              onChange={handleUserFilter}
            >
              <option value="">All Users</option>
              {getUniqueUsernames().map((username) => (
                <option key={username} value={username}>
                  {username}
                </option>
              ))}
            </select>
            <label className="sort-label" htmlFor="sortOrder">
              {/* empty label since 'ascending' and 'descending' are intuitive */}
            </label>
            <select
              id="sortOrder"
              value={sortDirection}
              onChange={handleSortOrderChange}
              // It doesn't make sense to change the sort order for a single selected user
              disabled={selectedUser !== ""}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <div className="board-display">
            {boardStates.map((status) => {
              const filtered = filteredTickets.filter(
                (ticket) => ticket.status === status
              );
              const sortedTicketsForStatus = sortTicketsByUser(filtered);
              return (
                <Swimlane
                  title={status}
                  key={status}
                  tickets={sortedTicketsForStatus}
                  deleteTicket={deleteIndvTicket}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Board;
