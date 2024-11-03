# main.py


#######################


import numpy as np
import random
import math




def partitions(n, k, min_p1=1):
    if k == 0:
        return [[]] if n == 0 else []
    else:
        ret = []
        for p1 in range(min_p1, n + 1):
            for ps in partitions(n - p1, k - 1, p1):
                ret.append([p1] + ps)

        return ret




def check_Sigma_Pj(P, n, k):
    Pj = np.zeros(k)
    for i in range(0, k):
        for j in range(0, i + 1):
            Pj[i] += P[j]

    for j in range(0, k):

        if (Pj[j] * n - (Pj[j] * (Pj[j] - 1)) / 2 < ((j + 1) * n * (n + 1)) / (2 * k)):
            return False

    return True





#######################

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Enable CORS for cross-origin requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; specify in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class NumberRequest(BaseModel):
    n: int

class PartitionRequest(BaseModel):
    n: int
    k: int

# Function to calculate the sum of integers from 1 to n (Sigma(n))
def Sigma_n(n):
    return sum(range(1, n + 1))

# Function to find divisors of Sigma(n) for possible k values
def give_k(n):
    sigma_n = Sigma_n(n)
    return [i for i in range(3, n // 2 + 1) if sigma_n % i == 0]



# API endpoint to get possible k values
@app.post("/get_k_options")
async def get_k_options(request: NumberRequest):
    n = request.n
    k_options = give_k(n)
    return {"k_options": k_options}
    
def get_s(n,k):
    return Sigma_n(n)/k
    

def getPartitions(n,k):

    List = partitions(n, k)
    target_sum=get_s(n,k)
    legal = []
    for list in List:
        if (check_Sigma_Pj(list, n, k) == True):
            legal.append(list)


    index=random.randint(0,len(legal)-1)

    return [legal[index]],target_sum
    
 
# API endpoint to get the partition of n into k subsets
@app.post("/get_partition")
async def get_partition(request: PartitionRequest):
    n = request.n
    k = request.k
    partition, target_sum = getPartitions(n, k)
    return {"partition": partition, "target_sum": target_sum}
