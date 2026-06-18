import os

print("Starting daily update...")

os.system("python update.py")

print("Training models...")

os.system("python train_stocks.py")

print("Finished.")