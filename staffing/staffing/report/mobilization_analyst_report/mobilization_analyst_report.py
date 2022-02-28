# Copyright (c) 2013, jan and contributors
# For license information, please see license.txt

import frappe
from calendar import monthrange
import datetime
def get_columns(filters):
	columns = [
		{"label": "Date","fieldname": "date", "fieldtype": "Date", "width": "150"},
		{"label": "Employee Code","fieldname": "employee_code", "fieldtype": "Data", "width": "150"},
		{"label": "Employee Name", "fieldname": "employee_name", "fieldtype": "Data", "width": "150"},
		{"label": "Staff Code", "fieldname": "staff_code", "fieldtype": "Data", "width": "150"},
		{"label": "Staff Name", "fieldname": "staff_name", "fieldtype": "Data", "width": "150"},
		{"label": "Customer Name", "fieldname": "customer_name", "fieldtype": "Data", "width": "150"},
		{"label": "Supplier Name", "fieldname": "supplier_name", "fieldtype": "Data", "width": "150"},
		{"label": "Staffing Project", "fieldname": "staffing_project", "fieldtype": "Link","options": "Staffing Project", "width": "150"},
		{"label": "Mobilization Date", "fieldname": "m_date", "fieldtype": "Date", "width": "150"},
		{"label": "Demobilization Date", "fieldname": "d_date", "fieldtype": "Date", "width": "150"},
		{"label": "Nationality", "fieldname": "nationality", "fieldtype": "Data", "width": "150"},
		{"label": "Iqama Number", "fieldname": "iqama_number", "fieldtype": "Data", "width": "150"},
		{"label": "Mobile Number", "fieldname": "mobile_number", "fieldtype": "Data", "width": "150"},

	]
	return columns
def execute(filters=None):
	months = ['January', "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"]
	columns, data = get_columns(filters), []
	months_no = " in ("
	month_no = ""
	if len(filters.get("month")) == 1:
		month_no += " = '" + str(months.index(filters.get("month")[0]) + 1) + "'"
	elif len(filters.get("month")) > 1:
		for i in filters.get("month"):
			if months_no[len(months_no) - 1] != "(":
				months_no += ","
			months_no += str((months.index(i) + 1))
		months_no += ")"
	final_months = month_no if len(filters.get("month")) == 1 else months_no if len(
		filters.get("month")) > 1 else " = '1'"

	condition = get_condition(filters)

	types = filters.get("staff_employee") if filters.get("staff_employee") else ["Staff", "Employee"]
	print("tyyyyyyyype")
	print(filters.get("staff_employee"))
	for type in types:
		fields = get_fields(type)
		inner_join_filter = get_inner_join_filter(type)
		query = """ SELECT 
						{0}
					FROM `tab{1}` E 
					INNER JOIN `tabTimesy` T ON {2} = E.name
					WHERE T.status = 'Completed' and MONTH(T.start_date) {3} {4}""".format(fields,type,inner_join_filter,final_months,condition)
		data += frappe.db.sql(query, as_dict=1)

	return columns, data

def get_condition(filters):
	condition = ""
	if filters.get("from_date") and filters.get("from_date"):
		condition += " and T.start_date BETWEEN '{0}' and '{1}'".format(filters.get("from_date"),filters.get("to_date"))

	if filters.get("employee") and filters.get("type") == 'Employee':
		condition += " and E.name = '{0}'".format(filters.get("employee"))

	if filters.get("staff") and filters.get("type") == 'Staff':
		condition += " and E.name = '{0}'".format(filters.get("staff"))

	if filters.get("type"):
		condition += " and T.reference_type = '{0}'".format(filters.get("type"))

	if filters.get("staffing_project"):
		condition += " and T.staffing_project = '{0}'".format(filters.get("staffing_project"))

	if filters.get('supplier'):
		condition += " and T.supplier = '{0}'".format(filters.get("supplier"))

	if filters.get('customer'):
		condition += " and T.customer = '{0}'".format(filters.get("customer"))

	return condition

def get_fields(type):
	fields = ""
	if type == "Employee":
		fields = "T.employee_code as employee_code, T.start_date as date," \
				 "T.employee_name as employee_name, T.customer_name, T.supplier_name, " \
				 "T.staffing_project, T.demobilization_date as d_date, E.nationality,E.date_of_joining as m_date, E.cell_number as mobile_number, E.iqama_number," \
				 "T.name"
		print(fields)
	elif type == "Staff":
		fields = "T.staff_code as staff_code, T.start_date as date," \
				 "T.staff_name as staff_name, T.customer_name, T.supplier_name, T.staffing_project, " \
				 "T.demobilization_date as d_date, E.emergency_contact_number as mobile_number, E.iqama_number,E.nationality, E.mobilization_date as m_date," \
				 "T.name"
		print(fields)
	return fields

def get_inner_join_filter(type):
	return "T.employee_code" if type == 'Employee' else "T.staff_code"
