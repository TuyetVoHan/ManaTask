# app/db/base.py
from sqlalchemy.orm import declarative_base

# Base là lớp cha. Sau này khi định nghĩa bảng Projects, Tasks... 
# chúng ta sẽ cho chúng kế thừa lớp Base này để SQLAlchemy hiểu đó là một bảng trong DB.
Base = declarative_base()