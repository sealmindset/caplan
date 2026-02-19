import os

current_dir = os.getcwd()
provider_files = []

for root, dirs, files in os.walk(current_dir):
    for file in files:
        if file == "provider.tf" and not '/.terraform/' in root :
             provider_files.append(os.path.join(root, file))

for provider_file in provider_files:

    provider_folder = os.path.dirname(provider_file)

    # Switch directories to that file so we can run the init command in the right dir
    dir_name = os.path.dirname(provider_file)
    os.chdir(dir_name)

    os.system('terraform init -upgrade -backend=false')
