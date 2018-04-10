import * as React from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form';
import * as moment from 'moment'

// generate option element from rideStatus
function rideStatusOption(rs) {
    return <option key={rs.rideStatusId} value={rs.rideStatusId}>{rs.rideStatus}</option>
}

// generate option element from rideType
function rideTypeOption(rt) {
    return <option key={rt.rideTypeId} value={rt.rideTypeId}>{rt.rideType}</option>
}

let RideForm = props => {
    // format date initial values
    if (typeof props.initialValues !== 'undefined' &&
            typeof props.initialValues.installationDate !== 'undefined') {
        const dateString = props.initialValues.installationDate;
        props.initialValues.installationDate = moment(dateString).format('YYYY-MM-DD')
    }

    const { handleSubmit, pristine, reset, submitting } = props;

    // assigns rideStatusList and rideTypeList if they are loaded
    const rsl =
        (typeof props.props !== 'undefined' &&
            typeof props.props.rideStatusList !== 'undefined' ?
            props.props.rideStatusList : []);
    const rtl =
        (typeof props.props !== 'undefined' &&
            typeof props.props.rideTypeList !== 'undefined' ?
            props.props.rideTypeList : []);

    return (
        <form onSubmit={handleSubmit}>
        <label>Name</label>
        <Field 
            name="rideName" 
            component="input" 
            type="text" 
        />
        <label>Total Capacity</label>
        <Field 
            name="totalCapacity" 
            component="input" 
            type="number" 
        />
		<label>Installation Date</label>
		<Field 
			name="installationDate" 
			component="input" 
			type="date" 
		/>
        <label>Ride Status</label>
        <Field 
            name="status" 
            component="select" 
        >
            <option value='' disabled>Select Status</option>
            {...rsl.map(rideStatusOption)}
        </Field>
        <label>FastPass Possible</label>
        <Field 
            name="fastPassPossible" 
            component="input" 
            type="checkbox" 
        />
        <label>Ride Type</label>
        <Field 
            name="rideType" 
            component="select"
        >
            <option value='' disabled>Select Type</option>
            {...rtl.map(rideTypeOption)}
        </Field>

		<button type="submit" disabled={pristine || submitting}>
			Submit
		</button>
		<button type="button" disabled={pristine || submitting} onClick={reset}>
			Reset
		</button>
	</form>);
}

RideForm = reduxForm({
})(RideForm);

export default RideForm;