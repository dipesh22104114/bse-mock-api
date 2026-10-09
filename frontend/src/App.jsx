import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000/ws/trades";

const ROWS_PER_PAGE = 25;

function App() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [wsConnected, setWsConnected] = useState(false);

  // --------------------------------------------------
  // Fetch trades from FastAPI
  // --------------------------------------------------

  const fetchTrades = async () => {
    try {
      const response = await fetch(`${API_URL}/getTrades`);

      if (!response.ok) {
        throw new Error("Failed to fetch trades");
      }

      const data = await response.json();

      setTrades(data.trades || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trades:", error);
      setMessage("Unable to connect to the backend.");
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Start BSE trade pull
  // --------------------------------------------------

  const startPull = async () => {
    try {
      setPulling(true);
      setMessage("Trade pull started. Waiting for BSE data...");

      const response = await fetch(`${API_URL}/start-pull`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start pull");
      }

      const data = await response.json();

      console.log("Pull response:", data);
    } catch (error) {
      console.error("Error starting pull:", error);

      setPulling(false);
      setMessage("Failed to start trade pull.");
    }
  };

  // --------------------------------------------------
  // WebSocket connection
  // --------------------------------------------------

  useEffect(() => {
    // Load existing trades immediately
    fetchTrades();

    // Open WebSocket connection
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setWsConnected(true);
    };

    socket.onmessage = (event) => {
      console.log("WebSocket message:", event.data);

      const data = JSON.parse(event.data);

      if (data.event === "trades_updated") {
        setPulling(false);

        setMessage(
          `${data.count.toLocaleString()} trades successfully loaded.`
        );

        // Fetch the newly available trades
        fetchTrades();

        // Return to first page
        setCurrentPage(1);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
    };

    // Close WebSocket when component is removed
    return () => {
      socket.close();
    };
  }, []);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredTrades = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return trades;
    }

    return trades.filter((trade) => {
      return (
        trade.trade_id?.toLowerCase().includes(query) ||
        trade.client?.toLowerCase().includes(query) ||
        trade.symbol?.toLowerCase().includes(query)
      );
    });
  }, [trades, search]);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const totalPages = Math.ceil(
    filteredTrades.length / ROWS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * ROWS_PER_PAGE;

  const visibleTrades = filteredTrades.slice(
    startIndex,
    startIndex + ROWS_PER_PAGE
  );

  // --------------------------------------------------
  // Format price
  // --------------------------------------------------

  const formatPrice = (price) => {
    return Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // --------------------------------------------------
  // Format timestamp
  // --------------------------------------------------

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "-";
    }

    return new Date(timestamp).toLocaleString("en-IN");
  };

  // --------------------------------------------------
  // Search handler
  // --------------------------------------------------

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="app">

      {/* ============================================
          TOP NAVIGATION
      ============================================ */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-icon">
            B
          </div>

          <div>
            <h1>BSE Trade Monitor</h1>

            <p>
              Real-time trade data dashboard
            </p>
          </div>

        </div>


        <div className="connection">

          <span
            className={
              wsConnected
                ? "status-dot online"
                : "status-dot offline"
            }
          />

          <span>
            {wsConnected
              ? "Live Connection"
              : "Disconnected"}
          </span>

        </div>

      </header>


      <main className="container">

        {/* ============================================
            PAGE HEADER
        ============================================ */}

        <section className="page-header">

          <div>

            <h2>Trades Overview</h2>

            <p>
              Monitor trades pulled from the BSE exchange.
            </p>

          </div>


          <button
            className="pull-button"
            onClick={startPull}
            disabled={pulling}
          >

            {pulling ? (
              <>
                <span className="spinner" />
                Pulling Trades...
              </>
            ) : (
              <>
                ↻
                Start Trade Pull
              </>
            )}

          </button>

        </section>


        {/* ============================================
            STAT CARDS
        ============================================ */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              #
            </div>

            <div>
              <p>Total Trades</p>

              <h3>
                {trades.length.toLocaleString()}
              </h3>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>
              <p>System Status</p>

              <h3 className="status-text">
                {pulling ? "Pulling" : "Ready"}
              </h3>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ⚡
            </div>

            <div>
              <p>Data Source</p>

              <h3>BSE API</h3>
            </div>

          </div>

        </section>


        {/* ============================================
            MESSAGE
        ============================================ */}

        {message && (

          <div className="notification">

            <span>●</span>

            {message}

          </div>

        )}


        {/* ============================================
            TRADE TABLE
        ============================================ */}

        <section className="table-card">

          <div className="table-header">

            <div>

              <h3>Trade Records</h3>

              <p>
                {filteredTrades.length.toLocaleString()} records found
              </p>

            </div>


            <div className="search-box">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search trade, client or symbol..."
                value={search}
                onChange={handleSearch}
              />

            </div>

          </div>


          {loading ? (

            <div className="loading">

              <div className="large-spinner" />

              <p>Loading trade data...</p>

            </div>

          ) : visibleTrades.length === 0 ? (

            <div className="empty">

              <div className="empty-icon">
                ⌕
              </div>

              <h3>No trades found</h3>

              <p>
                Try changing your search.
              </p>

            </div>

          ) : (

            <>

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>
                      <th>Trade ID</th>
                      <th>Client</th>
                      <th>Symbol</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Timestamp</th>
                    </tr>

                  </thead>


                  <tbody>

                    {visibleTrades.map((trade) => (

                      <tr key={trade.trade_id}>

                        <td>
                          <span className="trade-id">
                            {trade.trade_id}
                          </span>
                        </td>

                        <td>
                          {trade.client}
                        </td>

                        <td>

                          <span className="symbol">
                            {trade.symbol}
                          </span>

                        </td>

                        <td>
                          {trade.quantity.toLocaleString()}
                        </td>

                        <td className="price">
                          ₹{formatPrice(trade.price)}
                        </td>

                        <td className="timestamp">
                          {formatTimestamp(trade.timestamp)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>


              {/* ========================================
                  PAGINATION
              ======================================== */}

              <div className="pagination">

                <p>

                  Showing{" "}

                  <strong>
                    {filteredTrades.length === 0
                      ? 0
                      : startIndex + 1}
                  </strong>

                  {" "}to{" "}

                  <strong>
                    {Math.min(
                      startIndex + ROWS_PER_PAGE,
                      filteredTrades.length
                    )}
                  </strong>

                  {" "}of{" "}

                  <strong>
                    {filteredTrades.length}
                  </strong>

                </p>


                <div className="pagination-buttons">

                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => page - 1)
                    }
                  >
                    ← Previous
                  </button>


                  <span>
                    Page {currentPage} of {totalPages || 1}
                  </span>


                  <button
                    disabled={
                      currentPage === totalPages ||
                      totalPages === 0
                    }
                    onClick={() =>
                      setCurrentPage((page) => page + 1)
                    }
                  >
                    Next →
                  </button>

                </div>

              </div>

            </>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;