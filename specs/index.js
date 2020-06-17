/**
 * WordPress dependencies
 */
import { createNewPost } from '@wordpress/e2e-test-utils';

describe( 'Block Directory Test', () => {
	beforeAll( async () => {
		await createNewPost();
	} );

	it( 'try this test', async () => {
		expect(true).toBeFalsy();
	} );
} );
