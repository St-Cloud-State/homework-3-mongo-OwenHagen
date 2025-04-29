from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
import uuid

app = Flask(__name__)
client = MongoClient("mongodb://localhost:27017/")
db = client.acme_applications
applications = db.applications

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/add_application', methods=['POST'])
def add_application():
    data = request.json
    application_id = "APP" + str(uuid.uuid4().int)[:6]
    new_app = {
        "application_id": application_id,
        "name": data["name"],
        "address": data["address"],
        "status": "received",
        "notes": [],
        "processing": {
            "personal_details_check": { "completed": False, "notes": [] },
            "credit_check": { "completed": False, "notes": [] },
            "certification_check": { "completed": False, "notes": [] }
        },
        "acceptance_terms": [],
        "rejection_reason": None
    }
    applications.insert_one(new_app)
    return jsonify({"message": "Application submitted", "application_id": application_id})

@app.route('/api/status/<application_id>', methods=['GET'])
def get_status(application_id):
    app_doc = applications.find_one({"application_id": application_id})
    if app_doc:
        return jsonify({"status": app_doc["status"]})
    else:
        return jsonify({"status": "not found"})

@app.route('/api/update_status', methods=['POST'])
def update_status():
    data = request.json
    update = { "$set": { "status": data["new_status"] } }
    if data["new_status"] == "rejected":
        update["$set"]["rejection_reason"] = data.get("rejection_reason", "")
    applications.update_one({ "application_id": data["application_id"] }, update)
    return jsonify({"message": "Status updated"})

@app.route('/api/add_note', methods=['POST'])
def add_note():
    data = request.json
    note = {
        "type": data.get("type", "general"),
        "message": data["message"]
    }
    applications.update_one(
        { "application_id": data["application_id"] },
        { "$push": { "notes": note } }
    )
    return jsonify({"message": "Note added"})

@app.route('/api/add_processing_note', methods=['POST'])
def add_processing_note():
    data = request.json
    field_path = f"processing.{data['phase']}.notes"
    result = applications.update_one(
        { "application_id": data["application_id"] },
        { "$push": { field_path: data["message"] } }
    )
    if result.modified_count == 1:
        return jsonify({"message": "Processing note added."})
    else:
        return jsonify({"message": "Application not found or update failed."}), 404

@app.route('/api/complete_phase', methods=['POST'])
def complete_phase():
    data = request.json
    field_path = f"processing.{data['phase']}.completed"
    result = applications.update_one(
        { "application_id": data["application_id"] },
        { "$set": { field_path: True } }
    )
    if result.modified_count == 1:
        return jsonify({"message": "Subphase marked as complete."})
    else:
        return jsonify({"message": "Update failed or application not found."}), 404

@app.route('/api/application/<application_id>', methods=['GET'])
def get_application(application_id):
    app_doc = applications.find_one({"application_id": application_id}, {"_id": 0})
    if app_doc:
        return jsonify(app_doc)
    else:
        return jsonify({"error": "Application not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
