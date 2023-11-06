# Copyright (c) 2021, jan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from datetime import *
class Timesy(Document):

    @frappe.whitelist()
    def check_date(self, start_date, end_date):
        condition = ""
        if self.reference_type == 'Employee':
            condition += " and employee_code='{0}' ".format(self.employee_code)
        elif self.reference_type == 'Staff':
            condition += " and staff_code='{0}' ".format(self.staff_code)

        start_query = """ 
                        SELECT * FROM `tabTimesy` 
                        WHERE %s BETWEEN start_date and end_date and docstatus=1 and reference_type=%s {0}""".format(condition)
        end_query = """ 
                              SELECT * FROM `tabTimesy` 
                              WHERE %s BETWEEN start_date and end_date and docstatus=1 and reference_type=%s {0}""".format(
            condition)
        print(start_query)
        check_timesy_start = frappe.db.sql(start_query, (start_date, self.reference_type), as_dict=1)
        check_timesy_end = frappe.db.sql(end_query, (end_date, self.reference_type), as_dict=1)

        if len(check_timesy_start) > 0 or len(check_timesy_end) > 0:
            frappe.throw(""" There is already submitted time sheet with these dates """)
    @frappe.whitelist()
    def get_holiday(self):
        if not self.holiday_list:
            return

        holidays = frappe.get_doc("Holiday List", self.holiday_list)

        fridays = 0
        holidays_count = 0
        for i in holidays.holidays:
            print(i.holiday_date)
            if i.description == 'Friday' and datetime.strptime(str(i.holiday_date), '%Y-%m-%d') >= datetime.strptime(self.start_date, '%Y-%m-%d') and datetime.strptime(str(i.holiday_date), '%Y-%m-%d') <= datetime.strptime(self.end_date, '%Y-%m-%d'):
                fridays += 1
            elif datetime.strptime(str(i.holiday_date), '%Y-%m-%d') >= datetime.strptime(self.start_date, '%Y-%m-%d') and datetime.strptime(str(i.holiday_date), '%Y-%m-%d') <= datetime.strptime(self.end_date, '%Y-%m-%d'):
                holidays_count += 1
        print("HOLIIIIDAYS")
        print(holidays_count)
        print(fridays)
        return holidays_count,fridays
    @frappe.whitelist()
    def validate(self):
        if self.skip_timesheet:
            for i in self.monthly_timesheet:
                if i.type in ['Working Days', 'Working Fridays', 'Working Holidays'] and (not i.working_hour or not i.number):
                    frappe.throw("Working Hours and Working Days is mandatory for " + i.type)

            self.status = 'Completed'
        else:
            self.status = 'In Progress'

        self.check_date(self.start_date,self.end_date)

        if not self.skip_timesheet:
            for i in self.timesy_details:
                if i.working_hour == 0 and i.status == 'Working':
                    frappe.throw("Working Hour must be greater than 0 for Working")

        total_deduction = 0
        if self.total_costing_rate_deduction:
            total_deduction += self.total_costing_rate_deduction
        if self.ppe_deduction:
            total_deduction += self.ppe_deduction
        self.total_deduction = total_deduction

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
        query = """ UPDATE `tabStaffing Cost` SET demobilization_date='{0}', status='Expired' WHERE docstatus = 1 {1}""".format(self.demobilization_date,condition)
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
                "employee_code": "employee",
                "total_overtime_hour": "amount",
            }
        }
    }, ignore_permissions=True)

    doc.append("timesy_list", {
        "timesy": source_name
    })
    timesy_doc = doc.insert()
    timesy_doc.submit()

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
    print("workingggg ...")
    print(timesy.total_costing_rate_before_deduction)
    doc = get_mapped_doc("Timesy", source_name, {
        "Timesy": {
            "doctype": "Sales Invoice",
            "validation": {
                "docstatus": ["=", 1]
            },
            "field_map": {
                "start_date": "posting_date",
                "end_date": "due_date",
                "total_deduction":"discount_amount",
            }
        }
    }, ignore_permissions=True)

    doc.append("timesy_list", {
        "timesy": source_name,
        "staff_name": timesy.staff_name if timesy.reference_type == 'Staff' else timesy.employee_name,
        "staffing_project": timesy.staffing_project,
        "total_costing_rate": timesy.total_costing_rate_before_deduction,
    })
    doc.append("items", {
        "item_code": timesy.item,
        "rate": timesy.total_costing_rate_before_deduction,
        "amount": timesy.total_costing_rate_before_deduction,
        "qty":1

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
    i_name = frappe.db.get_value("Item",timesy.item,"item_name")
    uom = frappe.db.get_value("Item",timesy.item,"stock_uom")
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
        "timesy": source_name,
        "staff_name": timesy.staff_name if timesy.reference_type == 'Staff' else timesy.employee_name,
        "staffing_project": timesy.staffing_project,
        "total_costing_rate": timesy.total_costing_hour,
    })
    doc.append("items", {
        "item_code": timesy.item,
        "item_name":i_name,
        "uom":uom,
        "qty": 1,
        "rate": timesy.total_billing_hour

    })
    return doc