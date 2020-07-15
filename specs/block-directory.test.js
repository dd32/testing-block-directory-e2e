/**
 * External dependencies
 */
const core = require( '@actions/core' );
const github = require( '@actions/github' );

/**
 * WordPress dependencies
 */
import {
	createNewPost,
	searchForBlock,
	insertBlock,
	getAllBlocks,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */

import {
	getInstalledBlocks,
	getThirdPartyBlocks,
	runTest,
	removeAllBlocks,
} from '../utils';

// We don't want to see warnings during these tests
console.warn = () => {};

const urlMatch = ( url ) => {
	const urlPart = '/wp/v2/block-directory/search';
	const encoded = encodeURIComponent( urlPart );
	return url.indexOf( urlPart ) >= 0 || url.indexOf( encoded ) >= 0;
};

describe( `Block Directory Tests`, () => {
	beforeEach( async () => {
		await createNewPost();
		await removeAllBlocks();
	} );

    it( 'Block returns from API and installs', async () => {
		try {
			const { searchTerm } = github.context.payload.client_payload;
			await searchForBlock( searchTerm );

			const finalResponse = await page.waitForResponse(
				( response ) =>
					urlMatch( response.url() ) &&
					response.status() === 200 &&
					response.request().method() === 'GET' // We don't want the OPTIONS request
			);

			const resp = await finalResponse.json();

			runTest( () => {
				expect( Array.isArray( resp ) ).toBeTruthy();
			}, "Search result isn't an array." );

			runTest( () => {
				expect( resp.length ).toBeLessThan( 2 );
			}, 'We found multiple blocks for that string.' );

			runTest( () => {
				expect( resp ).toHaveLength( 1 );
			}, 'We found no matching blocks in the directory.' );

			let addBtn = await page.waitForSelector(
				'.block-directory-downloadable-blocks-list li:first-child button'
			);

			runTest( () => {
				expect( addBtn ).toBeDefined();
			}, "The block wasn't returned from the API." );
            
			// Add the block
			await addBtn.click();

			await new Promise( ( resolve ) => setTimeout( resolve, 5000 ) );

			const blocks = await getThirdPartyBlocks();

			runTest( () => {
				expect( blocks.length ).toBeGreaterThan( 0 );
			}, "Couldn't install the block." );
		} catch ( e ) {
            core.setFailed( e );
            throw new Error();
		}
	} );

	it( 'Block can be inserted in the document', async () => {
		try {
			const blocks = await getThirdPartyBlocks();

			runTest( () => {
				expect( blocks.length ).toBeGreaterThan( 0 );
			}, 'Could not find block in registered block list on page load.' );

			runTest( () => {
				expect( blocks ).toHaveLength( 1 );
			}, 'Block registers multiple blocks.' );

			await insertBlock( blocks[ 0 ] );
			const blockList = await getAllBlocks();

			runTest( () => {
				expect( blockList ).toHaveLength( 1 );
			}, 'Block was not found in document after insert.' );
		} catch ( e ) {
            core.setFailed( e );
            throw new Error();
		}
	} );
} );
