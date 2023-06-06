# Copyright (c) 2023, jan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class WorkforceMobilization(Document):
	@frappe.whitelist()
	def get_document(self):
		if self.reference_type=="Employee":
			data = frappe.db.sql("""select name from `tabWorkforce Mobilization` where employee_code=%s and (status='Standby' or status='Released')""",self.employee_code,as_dict=1)
		elif self.reference_type=="Staff":
			print("staff")
			data = frappe.db.sql("""select name from `tabWorkforce Mobilization` where staff_code=%s and (status='Standby' or status='Released')""",self.staff_code,as_dict=1)
		if data:
			return data
	@frappe.whitelist()
	def set_complete(self):
		frappe.db.set_value("Workforce Mobilization",self.workforce_mobilization,"status","Completed")