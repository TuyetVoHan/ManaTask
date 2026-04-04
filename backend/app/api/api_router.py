from fastapi import APIRouter
# Import thêm statuses
from app.api.endpoints import auth, projects, tasks, users, statuses 
from app.api.endpoints import auth, projects, tasks, users, statuses, notifications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
# Gắn thêm dòng này:
api_router.include_router(statuses.router, prefix="/statuses", tags=["Statuses"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])