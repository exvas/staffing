# Copyright (c) 2013, jan and contributors
# For license information, please see license.txt

import frappe
from calendar import monthrange

def get_columns(filters):
	columns = [
		{"fieldname": "employee", "fieldtype": "Data", "width": "150"},
		{"label": "Name", "fieldname": "employee_staff_name", "fieldtype": "Data", "width": "150"},
		{"label": "Position", "fieldname": "designation", "fieldtype": "Data", "width": "150"},
	]
	columns[0]['label'] = "EmpID" if filters.get("type") == "Employee" else "StaffID"
	return columns
def execute(filters=None):
	months = ['January', "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"]
	columns, data = get_columns(filters), []
	print(filters)
	month_no = months.index(filters.get("month")) + 1
	num_days = monthrange(2019, month_no)[1]  # num_days = 28
	condition = get_condition(filters)
	for i in range (1,num_days+1):
		columns.append({
			"label": str(i),
			"fieldname": str(i),
			"fieldtype": "Data",
			"width": "50",
		})
	columns.append({"label": "Total Hours", "fieldname": "total_hour", "fieldtype": "Data", "width": "100"},)
	columns.append({"label": "Rate/hr", "fieldname": "default_cost_rate_per_hour", "fieldtype": "Data", "width": "90"},)
	columns.append({"label": "No of Absent", "fieldname": "absent", "fieldtype": "Data", "width": "120"},)
	columns.append({"label": "Amount", "fieldname": "amount", "fieldtype": "Data", "width": "100"},)
	columns.append({"label": "Total Absent Deduction", "fieldname": "total_absent_deduction_per_hour", "fieldtype": "Data", "width": "200"},)
	columns.append({"label": "Net Total", "fieldname": "net_total", "fieldtype": "Data", "width": "120"},)
	# select_fields =
	types = [filters.get("type")] if filters.get("type") else ["Staff", "Employee"]
	for type in types:
		fields = get_fields(type)
		inner_join_filter = get_inner_join_filter(type)
		query = """ SELECT 
						{0}
					FROM `tab{1}` E 
					INNER JOIN `tabTimesy` T ON {2} = E.name
					INNER JOIN `tabStaffing Cost` SC ON SC.name = T.staffing_type
					WHERE T.status = 'Completed' and MONTH(T.start_date) = '{3}' and YEAR(T.start_date) = '{4}' {5}""".format(fields,type,inner_join_filter,month_no,filters.get("fiscal_year"),condition)
		print(query)
		data += frappe.db.sql(query, as_dict=1)
		print(data)
		for x in data:
			timesy_details = frappe.db.sql(""" SELECT DAY(date) as day_of_the_month, working_hour, status FROM `tabTimesy Details` WHERE parent=%s""", x.name, as_dict=1)
			print(timesy_details)
			sum = 0
			absent = 0
			for xx in timesy_details:
				if xx.status != "Absent":
					sum += xx.working_hour
					x[str(xx.day_of_the_month)] = xx.working_hour
				if xx.status == "Absent":
					absent += 1
			x['total_hour'] = sum
			x['amount'] = x.default_cost_rate_per_hour * sum
			x['absent'] = absent
			print("=================================")
			print(absent)
			print(x.absent_deduction_per_hour)
			print(absent * x.absent_deduction_per_hour)
			x['total_absent_deduction_per_hour'] = absent * x.absent_deduction_per_hour
			x['net_total'] = x['amount'] - x['total_absent_deduction_per_hour']

	return columns, data

def get_condition(filters):
	condition = ""

	if filters.get("employee"):
		condition += " and E.name = '{0}'".format(filters.get("employee"))

	if filters.get("staff"):
		condition += " and E.name = '{0}'".format(filters.get("staff"))

	if filters.get("type"):
		condition += " and T.reference_type = '{0}'".format(filters.get("type"))

	if filters.get("staffing_project"):
		condition += " and T.staffing_project = '{0}'".format(filters.get("staffing_project"))

	return condition

def get_fields(type):
	fields = ""
	if type == "Employee":
		fields = "T.employee_code as employee," \
				 "T.employee_name as employee_staff_name," \
				 "E.designation,T.name," \
				 "SC.default_cost_rate_per_hour," \
				 "SC.absent_deduction_per_hour"
		print(fields)
	elif type == "Staff":
		fields = "T.staff_code as employee," \
				 "T.staff_name as employee_staff_name," \
				 "E.designation,T.name," \
				 "SC.default_cost_rate_per_hour," \
				 "SC.absent_deduction_per_hour"
		print(fields)
	return fields

def get_inner_join_filter(type):
	return "T.employee_code" if type == 'Employee' else "T.staff_code"
