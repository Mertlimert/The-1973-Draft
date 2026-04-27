from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    user_input: str = Field(..., min_length=3, max_length=240)

