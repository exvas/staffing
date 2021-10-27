# Copyright (c) 2021, jan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from datetime import date
class Timesy(Document):
    @frappe.whitelist()
    def check_date(self, date):
        pass
    @frappe.whitelist()
    def check_invoices(self):
        si = frappe.db.sql(""" SELECT COUNT(*) as count FROM `tabSales Invoice` SI INNER JOIN `tabTimesy List` TL ON TL.parent = SI.name WHERE TL.timesy = %s and SI.docstatus=1""", self.name,as_dict=1)
        pi = frappe.db.sql(""" SELECT COUNT(*) as count FROM `tabPurchase Invoice` PI INNER JOIN `tabTimesy List` TL ON TL.parent = PI.name WHERE TL.timesy = %s and PI.docstatus=1""", self.name,as_dict=1)
        additional_salary = frappe.db.sql(""" SELECT COUNT(*) as count FROM `tabAdditional Salary` ADS INNER JOIN `tabTimesy List` TL ON TL.parent = ADS.name WHERE TL.timesy = %s and ADS.docstatus=1""", self.name,as_dict=1)

        return si[0].count > 0,pi[0].count > 0, additional_salary[0].count > 0
    @frappe.whitelist()
    def change_status(self, status):
        frappe.db.sql(""" UPDATE `tabTimesy` SET status=%s WHERE name=%s""",(status, self.name))
        frappe.db.commit()

    @frappe.whitelist()
    def change_date(self):
        condition = ""
        if self.reference_type == "Employee":
            condition += " and employee_code='{0}' ".format(self.employee_code)
        if self.reference_type == "Staff":
            condition += " and staff_code='{0}' ".format(self.staff_code)
        query = """ UPDATE `tabStaffing Cost` SET demobilization_date=%s, status='Expired' WHERE docstatus = 1 {0}""".format(condition)
        frappe.db.sql(query)
        frappe.db.commit()

@frappe.whitelist()
def generate_as(source_name, target_doc=None):
    # obj = {
    #     "doctype": doctype,
    #     "posting_date": self.start_date,
    #     "due_date": self.end_date,
    #     "timesy": [{
    #         "timesy": self.name
    #     }],
    #     "items": [{
    #         "item_code": self.item
    #     }]
    # }
    # doc = frappe.get_doc(doctype, obj).insert()
    # return doc.name
    timesy = frappe.get_doc("Timesy", source_name)
    doc = get_mapped_doc("Timesy", source_name, {
        "Timesy": {
            "doctype": "Additional Salary",
            "validation": {
                "docstatus": ["=", 1]
            },
            "field_map": {
                "start_date": "payroll_date",
                "employee_code": "employee",
                "total_overtime_hour": "amount",
            }
        }
    }, ignore_permissions=True)

    doc.append("timesy_list", {
        "timesy": source_name
    })
    return doc
@frappe.whitelist()
def generate_si(source_name, target_doc=None):
    # obj = {
    #     "doctype": doctype,
    #     "posting_date": self.start_date,
    #     "due_date": self.end_date,
    #     "timesy": [{
    #         "timesy": self.name
    #     }],
    #     "items": [{
    #         "item_code": self.item
    #     }]
    # }
    # doc = frappe.get_doc(doctype, obj).insert()
    # return doc.name
    timesy = frappe.get_doc("Timesy", source_name)
    doc = get_mapped_doc("Timesy", source_name, {
        "Timesy": {
            "doctype": "Sales Invoice",
            "validation": {
                "docstatus": ["=", 1]
            },
            "field_map": {
                "start_date": "posting_date",
                "end_date": "due_date",
            }
        }
    }, ignore_permissions=True)

    doc.append("timesy_list", {
        "timesy": source_name
    })
    doc.append("items", {
        "item_code": timesy.item
    })
    return doc


@frappe.whitelist()
def generate_pi(source_name, target_doc=None):
    # obj = {
    #     "doctype": doctype,
    #     "posting_date": self.start_date,
    #     "due_date": self.end_date,
    #     "timesy": [{
    #         "timesy": self.name
    #     }],
    #     "items": [{
    #         "item_code": self.item
    #     }]
    # }
    # doc = frappe.get_doc(doctype, obj).insert()
    # return doc.name
    timesy = frappe.get_doc("Timesy", source_name)
    doc = get_mapped_doc("Timesy", source_name, {
        "Timesy": {
            "doctype": "Purchase Invoice",
            "validation": {
                "docstatus": ["=", 1]
            },
            "field_map": {
                "start_date": "posting_date",
                "end_date": "due_date",
            }
        }
    }, ignore_permissions=True)

    doc.append("timesy_list", {
        "timesy": source_name
    })
    doc.append("items", {
        "item_code": timesy.item,
        "qty": 1
    })
    return doc