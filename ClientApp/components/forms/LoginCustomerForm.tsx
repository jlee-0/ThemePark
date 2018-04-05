import * as React from 'react';

import { Field, reduxForm } from 'redux-form';

let LoginCustomerForm = props => {
    const { handleSubmit, reset, submitting } = props;
    return <div>
    	<form onSubmit={handleSubmit}>
    		<label>Username</label>
    		<Field 
    			name="customerUserName" 
    			component="input" 
    			type="text" 
    		/>
    		<label>Password</label>
    		<Field 
    			name="customerPassword" 
    			component="input" 
    			type="text" 
    		/>
    		<button type="submit" disabled={submitting}>
    			Submit
    		</button>
    		<button type="button" disabled={submitting} onClick={reset}>
    			Reset
    		</button>
    	</form>
    </div>;
}

LoginCustomerForm = reduxForm({
})(LoginCustomerForm);

export default LoginCustomerForm;