from flask import Blueprint, request, jsonify, make_response
from extention import db
from datetime import date
from models import Task # Assuming Task model is in 'app/tasks/models.py'

# Initialize the Blueprint
tasks_bp = Blueprint('tasks', __name__, url_prefix='')

# --- 1. CREATE (POST /api/tasks/) ---
@tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    """Creates a new Task record."""
    data = request.get_json()
    # Basic validation
    if not data or 'title' not in data or 'due_date' not in data:
        return make_response(jsonify({"message": "Missing required fields (title, due_date)"}), 400)

    try:
        # Expects YYYY-MM-DD format for date conversion
        due_date_str = data.get('due_date')
        due_date_obj = date.fromisoformat(due_date_str) 

        new_task = Task(
            case_id=data.get('case_id'),
            assigned_to_id=data.get('assigned_to_id'),
            title=data['title'],
            description=data.get('description'),
            due_date=due_date_obj,
            status=data.get('status', 'Pending'),
            priority=data.get('priority', 'Medium')
        )

        db.session.add(new_task)
        db.session.commit()

        return make_response(jsonify(new_task.to_dict()), 201)
    
    except ValueError as e:
        return make_response(jsonify({"message": f"Invalid date format. Expected YYYY-MM-DD. Error: {e}"}), 400)
    except Exception as e:
        db.session.rollback()
        # In a real app, log the error (e)
        return make_response(jsonify({"message": "Server error while creating task."}), 500)

# --- 2a. READ ALL (GET /api/tasks/) ---
@tasks_bp.route('/tasks', methods=['GET'])
def get_all_tasks():
    """Retrieves a list of all tasks."""
    try:
        tasks = Task.query.all()
        tasks_list = [task.to_dict() for task in tasks]
        
        return jsonify(tasks_list)
    except Exception:
        # In a real app, log the error
        return make_response(jsonify({"message": "Server error while retrieving tasks."}), 500)

# --- 2b. READ ONE (GET /api/tasks/<id>) ---
@tasks_bp.route('tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Retrieves a single task by its ID."""
    task = Task.query.get(task_id)
    if task is None:
        return make_response(jsonify({"message": "Task not found"}), 404)
    
    return jsonify(task.to_dict())

# --- 3. UPDATE (PATCH /api/tasks/<id>) ---
@tasks_bp.route('tasks/<int:task_id>', methods=['PATCH'])
def update_task(task_id):
    """Updates an existing task partially."""
    task = Task.query.get(task_id)
    if task is None:
        return make_response(jsonify({"message": "Task not found"}), 404)

    data = request.get_json()
    if not data:
        return make_response(jsonify({"message": "No data provided for update"}), 400)

    try:
        # Apply updates only for keys present in the request data
        if 'case_id' in data:
            task.case_id = data['case_id']
        if 'assigned_to_id' in data:
            task.assigned_to_id = data['assigned_to_id']
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'status' in data:
            task.status = data['status']
        if 'priority' in data:
            task.priority = data['priority']
        
        if 'due_date' in data:
            # Convert date string to date object
            task.due_date = date.fromisoformat(data['due_date'])
        
        db.session.commit()
        return jsonify(task.to_dict())
    
    except ValueError as e:
        db.session.rollback()
        return make_response(jsonify({"message": f"Invalid date format. Expected YYYY-MM-DD. Error: {e}"}), 400)
    except Exception:
        db.session.rollback()
        # In a real app, log the error
        return make_response(jsonify({"message": "Server error during task update."}), 500)

# --- 4. DELETE (DELETE /api/tasks/<id>) ---
@tasks_bp.route('tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Deletes a task by its ID."""
    task = Task.query.get(task_id)
    if task is None:
        return make_response(jsonify({"message": "Task not found"}), 404)
    
    try:
        db.session.delete(task)
        db.session.commit()
        
        # Respond with 204 No Content
        return make_response("", 204)
    except Exception:
        db.session.rollback()
        # In a real app, log the error
        return make_response(jsonify({"message": "Server error during task deletion."}), 500)