$(document).ready(function () {
  const viewAllButton = $("#view-all-blogs");
  const updateForm = $("#form-update");
  const deleteButton = $(".delete-button");
  const editButton = $(".edit-button");
  const cancelButton = $(".cancel-button");
  const $searchForm = $("#search-form");
  const $searchInput = $("#search-query");
  const $deleteSearchInput = $("#delete-search-query");
  let isAuthorized = $("#is-authorized").data("isauthorized");
  console.log("Is Authorized:", isAuthorized);

  if (!isAuthorized) {
    // Hide edit and delete buttons if the user is not authorized 
    editButton.addClass("hidden");
    deleteButton.addClass("hidden");
    cancelButton.addClass("hidden");
    $("#delete-form").addClass("hidden");
  } else {
    // Show edit and delete buttons if the user is authorized
    editButton.removeClass("hidden");
    deleteButton.removeClass("hidden");
    cancelButton.removeClass("hidden");
    $("#delete-form").removeClass("hidden");
  }
  

  // Scroll to the top of the page when the document is ready
  $(window).scrollTop(0);

  // Check if the user is authorized to edit or delete blog posts
  $(".login-form").on("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission
    const formData = $(this).serialize(); // Serialize the form data  
    fetch("/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(data.message || "Login successful");
          window.location.href = "/"; // Redirect to home page after successful login
        } else {
          alert(data.message || "Login failed. Please try again.");
        }
      })
      .catch((error) => console.error("Error:", error));
  });

  // This file contains the JavaScript code for the blog website
  const message = $("#msg").data("success");
  if (message) {
    alert(message);
  }

  // Show only the first 3 blog posts by default
  $(".blog-post").each(function (index) {
    if (index > 2) {
      $(this).addClass("hidden hide-the-rest"); // Hide blog posts after the first 3
    }
  });

  let showingAll = false;

  viewAllButton.on("click", function () {
    showingAll = !showingAll;
    // if true  do nothing, else scroll to top
    showingAll
      ? ""
      : $("html, body").animate(
          {
            scrollTop: 0,
          },
          500
        );

    $(".blog-post").each(function (index) {
      if (showingAll) {
        $(this).slideDown();
      } else {
        if (index > 2) {
          $(this).slideUp();
        }
      }
    });
    $(this).text(showingAll ? "View Less" : "View All");
  });

  if (editButton.length) {
    editButton.on("click", function () {
      const blogId = $(this).data("edit");
      $("#blog-content").addClass("hidden"); // Hide the blog display section
      $(".update-form").removeClass("hidden"); // Show the blog form section
      // window.location.href = `/edit/${blogId}`; // Redirect to the edit page for the blog post
    });
  }

  updateForm.on("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission
    const formData = $(this).serialize(); // Serialize the form data

    fetch(`/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          // $("#blog-content").removeClass("hidden"); // Show the blog display section // works fine without this
          alert(data.message);
          window.location.href = `/blog/${data.blogPost.title}/${data.blogPost.id}`; // Redirect to the blog page after update
        } else {
          alert("Error updating blog post.");
        }
      })
      .catch((error) => console.error("Error:", error));
  });

  if (cancelButton.length) {
    cancelButton.on("click", function () {
      $("#blog-content").removeClass("hidden"); // Show the blog display section
      $(".update-form").addClass("hidden"); // Hide the blog form section
      $("#form-update")[0].reset(); // Reset the form fields
    });
  }

  if (deleteButton.length) {
    deleteButton.on("click", function () {
      const blogId = $(this).data("delete");
      if (confirm("Are you sure you want to delete this blog post?")) {
        fetch(`/delete/${blogId}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            if (data.message) {
              alert(data.message);
              window.location.href = "/"; // Redirect to home page after deletion
            } else {
              alert("Error deleting blog post.");
            }
          })
          .catch((error) => console.error("Error:", error));
      } else {
        // Clear the delete search input if user cancels
        $deleteSearchInput.val("");
        // Optionally, also hide the delete button again
        $(".hidden-delete-button").fadeOut();
      }
    });
  }

  // submit for search

  $searchForm.on("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission
    const searchFormData = `query=${encodeURIComponent($searchInput.val())}`;
    // const searchFormData = $(this).serialize();

    // Redirect to the search results page with the query
    window.location.href = `/search?${searchFormData}`;
  });

  // Live search dropdown
  const $dropdown = $('<div id="search-dropdown"></div>');
  $searchInput.after($dropdown);

  $searchInput.on("input", function () {
    const val = $(this).val().trim().replace(/ /g, "-"); //.toLowerCase();

    $dropdown.css("width", $searchInput.outerWidth());

    if (val.length === 0) {
      $dropdown.hide();
      return;
    }
    $.get("/api/search?q=" + encodeURIComponent(val), function (results) {
      if (!results.length) {
        $dropdown.html('<div style="padding:8px;">No results</div>').show();
        return;
      }
      let html = "";
      results.forEach((post) => {
        html += `<div class="dropdown-item" style="padding:8px;cursor:pointer;" data-id="${
          post.id
        }" data-title="${post.title}">
                        <strong>${post.title.replace(/-/g, " ")}</strong><br>
                        <small>by ${post.author.replace(/-/g, " ")}</small>
                    </div>`;
      });
      $dropdown.html(html).show();
    });
  });

  // Handle click on dropdown item
  $dropdown.on("click", ".dropdown-item", function () {
    const id = $(this).data("id");
    const title = $(this).data("title");
    window.location.href = `/blog/${title}/${id}`;
  });

  // Hide dropdown when clicking outside
  $(document).on("click", function (e) {
    if (!$(e.target).closest("#search-dropdown, .search-query").length) {
      $dropdown.hide();
    }
  });

  // hide delete input
  $(".hidden-delete-button").addClass("hidden");
  // Live delete search dropdown
  const $deleteDropdown = $('<div id="delete-search-dropdown"></div>');
  $deleteSearchInput.after($deleteDropdown);
  $deleteDropdown.css("width", $deleteSearchInput.outerWidth());

  $deleteSearchInput.on("input", function () {
    const val = $(this).val().trim().replace(/ /g, "-"); //.toLowerCase();
    if (val.length === 0) {
      $deleteDropdown.hide();
      return;
    }
    $.get("/api/search?q=" + encodeURIComponent(val), function (results) {
      if (!results.length) {
        $deleteDropdown
          .html('<div style="padding:8px;">No results</div>')
          .show();
        return;
      }
      let html = "";
      results.forEach((post) => {
        html += `<div class="dropdown-item" style="padding:8px;cursor:pointer;" data-id="${
          post.id
        }" data-title="${post.title}">
                        <strong>${post.title.replace(/-/g, " ")}</strong><br>
                        <small>by ${post.author.replace(/-/g, " ")}</small>
                    </div>`;
      });
      $deleteDropdown.html(html).show();
    });
  });

  // Handle click on dropdown item
  $deleteDropdown.on("click", ".dropdown-item", function () {
    const id = $(this).data("id");
    const title = $(this).data("title");
    $(".hidden-delete-button").fadeIn(); // Show the delete button
    $deleteSearchInput.val(title.replace(/-/g, " ")); // Set the input value to the selected title
    deleteButton.data("delete", id); // Store the ID in the delete button data attribute
    $deleteDropdown.hide(); // Hide the dropdown after selection
  });

  // Hide dropdown when clicking outside
  $(document).on("click", function (e) {
    if (
      !$(e.target).closest("#delete-search-dropdown, .delete-search-query")
        .length
    ) {
      $deleteDropdown.hide();
    }
  });
});
