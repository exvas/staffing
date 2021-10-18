from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in staffing/__init__.py
from staffing import __version__ as version

setup(
	name="staffing",
	version=version,
	description="Staffing",
	author="jan",
	author_email="janlloydangeles@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
