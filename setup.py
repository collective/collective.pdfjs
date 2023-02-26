from setuptools import setup, find_packages
import os

version = '1.0.4'

setup(name='collective.pdfjs',
      version=version,
      description="pdf.js integration for Plone",
      long_description=open("README.rst").read() + "\n" +
                       open(os.path.join("docs", "HISTORY.txt")).read(),
      # Get more strings from
      # http://pypi.python.org/pypi?:action=list_classifiers
      classifiers=[
        "Environment :: Web Environment",
        "Framework :: Plone",
        "Framework :: Plone :: Addon",
        "Programming Language :: Python",
        "Framework :: Plone :: 6.0",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Operating System :: OS Independent",
        "License :: OSI Approved :: GNU General Public License v2 (GPLv2)",
        ],
      keywords='plone zope pdf JavaScript',
      author='zedr',
      author_email='zedr@zedr.com',
      url='http://pypi.python.org/pypi/collective.pdfjs',
      license='GPL',
      packages=find_packages("src", exclude=["ez_setup"]),
      namespace_packages=['collective'],
      package_dir={"": "src"},
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          'Products.CMFPlone',
          'plone.app.upgrade',
      ],
      extras_require={
          'test': ['plone.app.testing',],
      },
      entry_points="""
      # -*- Entry points: -*-

      [z3c.autoinclude.plugin]
      target = plone
      """,

      )
