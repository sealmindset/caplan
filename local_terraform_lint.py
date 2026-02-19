import os
import multiprocessing
import subprocess

def lintDir(dir):
    os.chdir(dir)
    envFolderName = os.path.split(dir)[1] 
    validateOutput = subprocess.run(['terraform', 'validate', '-no-color'], capture_output=True, text=True)
    print(f'{envFolderName} - validate - {validateOutput.stdout.strip() + validateOutput.stderr.strip()}')
    tfsecOutput = subprocess.run(['tfsec', '--tfvars-file', 'default.auto.tfvars', '--concise-output', '--no-color'], capture_output=True, text=True)
    print(f'{envFolderName} - tfsec - {tfsecOutput.stdout.strip() + tfsecOutput.stderr.strip()}')
if __name__ == "__main__":

    ogpath = os.getcwd()

    formatOutput = subprocess.run(['terraform', 'fmt', '--recursive', '-no-color'], capture_output=True, text=True)
    if formatOutput.returncode == 0 and formatOutput.stdout == '':
        print(f'All files already formatted properly')
    elif formatOutput.returncode == 0 and formatOutput.stdout != '':
        print(f'The following files were formatted\n{formatOutput.stdout.strip()}')
    else:
        print(f'File formatting failed {format.stderr}')

    # This assumes this script is in the root of the repository
    envFolder = os.path.join(ogpath, 'env')
    terraformDirs = []

    if os.path.isdir(envFolder):
        for file in os.listdir(envFolder):
            d = os.path.join(envFolder, file)
            if os.path.isdir(d):
                terraformDirs.append(d)

    jobs = []

    for terraformDir in terraformDirs:
        process = multiprocessing.Process(target=lintDir, args=[terraformDir])
        jobs.append(process)

    # Start the processes  
    for j in jobs:
        j.start()

    # Ensure all of the processes have finished
    for j in jobs:
        j.join()
