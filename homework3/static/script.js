async function submitApplication() {
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;

    const res = await fetch('/api/add_application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address })
    });

    const data = await res.json();
    document.getElementById("confirmation").innerText = `Submitted! ID: ${data.application_id}`;
}

async function checkStatus() {
    const id = document.getElementById("statusAppId").value;
    const res = await fetch(`/api/status/${id}`);
    const data = await res.json();
    document.getElementById("statusResult").innerText = `Status: ${data.status}`;
}

async function updateStatus() {
    const application_id = document.getElementById("updateAppId").value;
    const new_status = document.getElementById("newStatus").value;
    const rejection_reason = document.getElementById("rejectionReason").value;

    const res = await fetch('/api/update_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id, new_status, rejection_reason })
    });

    const data = await res.json();
    alert(data.message);
}

async function addNote() {
    const application_id = document.getElementById("noteAppId").value;
    const message = document.getElementById("noteMessage").value;

    const res = await fetch('/api/add_note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id, message })
    });

    const data = await res.json();
    alert(data.message);
}

async function addProcessingNote() {
    const application_id = document.getElementById("procNoteAppId").value;
    const phase = document.getElementById("processingPhase").value;
    const message = document.getElementById("procNoteMessage").value;

    const res = await fetch('/api/add_processing_note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id, phase, message })
    });

    const data = await res.json();
    alert(data.message);
}

async function markComplete() {
    const application_id = document.getElementById("completeAppId").value;
    const phase = document.getElementById("completePhase").value;

    const res = await fetch('/api/complete_phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id, phase })
    });

    const data = await res.json();
    alert(data.message);
}

async function viewApplication() {
    const id = document.getElementById("viewAppId").value;
    const res = await fetch(`/api/application/${id}`);
    const data = await res.json();

    if (data.error) {
        document.getElementById("appDetails").innerText = "Application not found.";
        return;
    }

    const container = document.getElementById("appDetails");
    container.innerHTML = `
        <h3>Application ID: ${data.application_id}</h3>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>Status:</strong> ${data.status}</p>

        <h4>Processing Stages:</h4>
        <ul>
            ${Object.entries(data.processing).map(([stage, detail]) => `
                <li><strong>${stage.replace(/_/g, ' ')}:</strong> 
                    ${detail.completed ? "✅ Complete" : "⏳ In Progress"}
                    ${detail.notes.length ? `<br>Notes: ${detail.notes.join(", ")}` : ""}
                </li>
            `).join("")}
        </ul>

        <h4>Notes:</h4>
        <ul>
            ${data.notes.length ? data.notes.map(note => `<li>${note.message}</li>`).join("") : "<li>No general notes</li>"}
        </ul>

        <h4>Acceptance Terms:</h4>
        <ul>
            ${data.acceptance_terms.length ? data.acceptance_terms.map(term => `<li>${term}</li>`).join("") : "<li>None</li>"}
        </ul>

        <h4>Rejection Reason:</h4>
        <p>${data.rejection_reason || "None"}</p>
    `;
}
