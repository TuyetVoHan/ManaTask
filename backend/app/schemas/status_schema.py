from pydantic import BaseModel

class StatusResponse(BaseModel):
    statusId: int
    statusName: str

    class Config:
        from_attributes = True