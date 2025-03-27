document.addEventListener("DOMContentLoaded", function () {
  const quoteElement = document.getElementById("quote");
  const newQuoteButton = document.getElementById("new-quote");
  const psychologistList = document.getElementById("psychologists");
  const nameInput = document.getElementById("name");
  const moodForm = document.getElementById("mood-form");
  const moodInput = document.getElementById("mood");
  const noteInput = document.getElementById("note");
  const moodList = document.getElementById("mood-list");
  const bookingForm = document.getElementById("booking-form");
  const bookingStatus = document.getElementById("booking-status");
  const appointmentsList = document.getElementById("appointments-list");
  let lastMood = null;

  function fetchQuote() {
    fetch("http://localhost:3000/quotes")
      .then((response) => response.json())
      .then((data) => {
        let randomIndex = Math.floor(Math.random() * data.length);
        let quote = data[randomIndex];
        quoteElement.innerText = `"${quote.text}" - ${quote.author}`;
      })
      .catch((error) => {
        quoteElement.innerText = "Failed to load quote. PLease try again .";
        console.error("Error fetching quote:", error);
      });
  }
  fetchQuote();
  newQuoteButton.addEventListener("click", fetchQuote);

  function fetchPsychologists() {
    fetch("http://localhost:3000/psychologists")
      .then((response) => response.json())
      .then((data) => {
        psychologistList.innerHTML = "";
        data.forEach((psy) => {
          let li = document.createElement("li");
          li.innerHTML = `${psy.name} - ${psy.specialty}
                <button class="connect-btn" data-id="${psy.id}">Connect</button>`;
          psychologistList.appendChild(li);
        });

        document.querySelectorAll(".connect-btn").forEach((button) => {
          button.addEventListener("click", function () {
            let psyId = this.getAttribute("data-id");
            showPsychologistDetails(psyId);
          });
        });
      })
      .catch((error) => console.error("Error fetching psychologists:", error));
  }
  fetchPsychologists();

  function showPsychologistDetails(psyId) {
    fetch(`http://localhost:3000/psychologists/${psyId}`)
      .then((response) => response.json())
      .then((psy) => {
        document.getElementById(
          "psy-details"
        ).innerText = `${psy.name} - ${psy.specialty}
            \nEmail: ${psy.email}
            \nPhone: ${psy.contact}`;
        document.getElementById("psychologist-details").style.display = "block";
      })
      .catch((error) =>
        console.error("Error fetching psychologist details:", error)
      );
  }

  document
    .getElementById("close-details")
    .addEventListener("click", function () {
      document.getElementById("psychologist-details").style.display = "none";
    });
  moodForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let newMood = {
      user: nameInput.value,
      mood: moodInput.value,
      note: noteInput.value,
    };

    if (
      lastMood &&
      newMood.mood === lastMood.mood &&
      newMood.note === lastMood.note
    ) {
      console.log("This mood is the same as the last one. Not submitting.");
      return;
    }

    fetch("http://localhost:3000/moodLogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMood),
    })
      .then((response) => response.json())
      .then((data) => {
        fetchMoods();
        moodInput.value = "";
        noteInput.value = "";
        lastMood = newMood;
      })
      .catch((error) => console.error("Error submitting mood:", error));
  });

  function fetchMoods() {
    fetch("http://localhost:3000/moodLogs")
      .then((response) => response.json())
      .then((data) => {
        moodList.innerHTML = "";
        data.forEach((mood) => {
          let li = document.createElement("li");
          li.innerHTML = `${mood.user} felt "${mood.mood}": ${mood.note}
            <button class="delete-btn" data-id="${mood.id}">Delete</button>`;
          moodList.appendChild(li);
        });

        document.querySelectorAll(".delete-btn").forEach((button) => {
          button.addEventListener("click", function () {
            let moodId = this.getAttribute("data-id");
            deleteMoodLog(moodId);
          });
        });
      })
      .catch((error) => console.error("Error fetching moods:", error));
  }
  fetchMoods();

  function deleteMoodLog(moodId) {
    fetch(`http://localhost:3000/moodLogs/${moodId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Mood log deleted successfully");
          fetchMoods();
        } else {
          alert("Failed to delete mood log");
        }
      })
      .catch((error) => console.error("Error deleting mood log:", error));
  }

  function populatePsychologists() {
    fetch("http://localhost:3000/psychologists")
      .then((response) => response.json())
      .then((data) => {
        const psychologistSelect = document.getElementById(
          "booking-psychologist"
        );
        data.forEach((psy) => {
          let option = document.createElement("option");
          option.value = psy.id;
          option.innerText = `${psy.name} - ${psy.specialty}`;
          psychologistSelect.appendChild(option);
        });
      })
      .catch((error) => console.error("Error fetching psychologists:", error));
  }

  populatePsychologists();

  
  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const bookingData = {
      name: document.getElementById("booking-name").value,
      psychologistId: document.getElementById("booking-psychologist").value,
      appointmentDate: document.getElementById("booking-date").value,
    };

    fetch("http://localhost:3000/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })
      .then((response) => response.json())
      .then((data) => {
        bookingStatus.innerText = `Appointment booked successfully! Your appointment ID is ${data.id}`;
      })
      .catch((error) => {
        bookingStatus.innerText =
          "Failed to book appointment. Please try again.";
        console.error("Error booking appointment:", error);
      });
  });
     function fetchUserAppointments(userName) {
       fetch("http://localhost:3000/appointments")
         .then((response) => response.json())
         .then((appointments) => {
            fetch("http://localhost:3000/psychologists")
         .then((response) => response.json())
         .then((psychologists) => {
            appointmentsList.innerHTML = "";
           const userAppointments = appointments.filter(
             (appointment) => appointment.name === userName
           );
           
           userAppointments.forEach((appointment) => {
            const psychologist = psychologists.find(
              psy => psy.id == appointment.psychologistId);
             let li = document.createElement("li");
             li.innerText = `Appointment with ${psychologist ? psychologist.name + " (" + psychologist.specialty + ")" : "Unknown Psychologist"} on ${appointment.appointmentDate}`;
             appointmentsList.appendChild(li);
           });
         });
        })
         .catch((error) =>
           console.error("Error fetching appointments:", error)
         );
     }
}); 
