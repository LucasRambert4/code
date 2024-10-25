<script>
    import { onMount } from 'svelte';
    let query = '';
    let shows = [];
    let isLoading = false;
    let error = '';
    let noResultsMessage = '';
  
    async function searchShows() {
      if (query.trim()) {
        isLoading = true;
        error = '';
        noResultsMessage = '';
        shows = [];
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          shows = data;
  
          if (shows.length === 0) {
            noResultsMessage = 'No results found.';
          }
        } catch (e) {
          error = 'Something went wrong while fetching data.';
        } finally {
          isLoading = false;
        }
      } else {
        shows = [];
        noResultsMessage = 'No results found.';
      }
    }
  
    function clearSearch() {
      query = '';
      shows = [];
      noResultsMessage = ''; // Clear the no results message
    }
  </script>
  
  <main>
    <h1>Search TV Shows</h1>
    
    <!-- Search and Results Count Container -->
    <div class="search-results-container">
      <!-- Search Form -->
      <form on:submit|preventDefault={searchShows} class="search-form">
        <div class="search-input-container">
          <input
            type="text"
            bind:value={query}
            placeholder="Enter TV show name"
            aria-label="TV Show Name"
          />
          {#if query} <!-- Only show clear button if there's text in the input -->
            <button type="button" class="clear-button" on:click={clearSearch}>
              &times; <!-- Clear (X) icon -->
            </button>
          {/if}
        </div>
        <button type="submit" disabled={isLoading}>Search</button>
      </form>      
  
      <!-- Display Results Count -->
      {#if shows.length > 0}
        <p class="results-count">{shows.length} result(s) found</p>
      {/if}
    </div>
  
    <!-- Loading Spinner -->
    {#if isLoading}
      <div class="loading-spinner"></div>
    {/if}
  
    <!-- Error Message -->
    {#if error}
      <p class="error">{error}</p>
    {/if}
  
    <!-- No Results Message -->
    {#if noResultsMessage}
      <p class="no-results">{noResultsMessage}</p>
    {/if}
  
    <!-- Display Shows as Cards -->
    {#if shows.length > 0}
      <div class="show-grid">
        {#each shows as { show }}
          <div class="show-card">
            <img src={show.image ? show.image.medium : 'https://via.placeholder.com/210x295'} alt={show.name} />
            <div class="show-info">
              <h2>{show.name}</h2>
              <p class="premiered">Premiered: {show.premiered ? show.premiered : 'N/A'}</p>
              <p class="summary">{@html show.summary || 'No summary available.'}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>
  
  <style>
    main {
      padding: 2rem;
      text-align: center;
    }
    h1 {
      margin-bottom: 1.5rem;
      font-size: 2.5rem;
      color: #333;
    }
  
    /* Search and Results Count Container */
    .search-results-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
    }
  
    /* Search Form */
    .search-form {
      display: flex;
      align-items: center;
      margin-right: 1.5rem;
    }
    .search-input-container {
      position: relative;
    }
    .search-form input {
      padding: 0.75rem;
      width: 300px;
      border: 2px solid #ccc;
      border-radius: 5px;
      font-size: 1rem;
      margin-right: 1rem;
    }

/* Search Form Button */
.search-form button[type="submit"] {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: blue; /* Main search button color */
  color: white; /* Text color */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-form button[type="submit"]:disabled {
  background-color: #ccc; /* Disabled state color */
  cursor: not-allowed;
}

.search-form button[type="submit"]:hover:not(:disabled) {
  color: white; /* Text color on hover */
  background-color: black; /* Background color on hover */
}

/* Clear Button */
.clear-button {
  position: absolute;
  padding: 0.75rem 1.5rem;
  right: 10px; 
  top: 50%;
  transform: translateY(-50%); 
  background: transparent; /* Explicitly set background to transparent */
  border: none; 
  color: black; /* Color for the X icon */
  font-size: 1.25rem;
  cursor: pointer; 
  transition: color 0.3s;
}

.clear-button:hover {
  color: #666; /* Change color on hover */
}

    /* Loading Spinner */
    .loading-spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007BFF;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 2rem auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  
    /* Error Message */
    .error {
      color: red;
      margin-bottom: 2rem;
    }
  
    /* No Results Message */
    .no-results {
      color: #666;
      font-size: 1.25rem;
      margin-top: 1rem;
    }
  
    /* Results Count */
    .results-count {
      font-size: 1.25rem;
      color: #333;
      margin-left: 1rem;
    }
  
    /* Show Cards */
    .show-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      justify-items: center;
      align-items: center;
    }
  
    .show-card {
      background-color: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 1rem;
      width: 100%;
      max-width: 90vw;
      margin: 0.5rem 0;
    }
  
    .show-card:hover {
      transform: translateY(-5px);
    }
    .show-card img {
      width: 100px;
      height: auto;
      margin-right: 1rem;
    }
  
    .show-info {
      padding: 1rem;
      flex-grow: 1;
    }
    .show-info h2 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #007BFF;
    }
    .premiered {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 1rem;
    }
    .summary {
      font-size: 0.875rem;
      color: #333;
      max-height: 3.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  </style>
  