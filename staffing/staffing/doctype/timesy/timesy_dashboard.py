from frappe import _


def get_data():
	return {
		'fieldname': 'timesy',
        'non_standard_fieldnames': {
            'Sales Invoice': 'timesy',
            'Additional Salary': 'timesy',
        },
		'transactions': [
			{
				'label': _('Linked Forms'),
				'items': [
					"Sales Invoice", "Purchase Invoice", "Additional Salary"
                ]
			}
		]
	}