from frappe import _


def get_data():
	return {
		'fieldname': 'staffing_type',
		'transactions': [
			{
				'label': _('Linked Forms'),
				'items': [
					"Staffing Cost"
                ]
			}
		]
	}