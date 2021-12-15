# Copyright (c) 2021, jan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class StaffingCost(Document):
	def validate(self):
		if self.default_cost_rate_per_hour == 0:
			frappe.throw("Default Cost Rate Per Hour must be greater than 0")

		if self.reference_type == 'Staff' and self.default_billing_rate_per_hour == 0:
			frappe.throw("Default Billing Rate Per Hour must be greater than 0")
