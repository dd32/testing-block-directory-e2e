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
	getEditedPostContent,
	deactivatePlugin,
	uninstallPlugin,
} from '@wordpress/e2e-test-utils';

/**
 * Internal dependencies
 */

import { getInstalledBlocks, runTest, removeAllBlocks } from '../utils';

// We don't want to see warnings during these tests
console.warn = () => {};

describe( `Block Directory Tests`, () => {
	beforeEach( async () => {
		await createNewPost();
		await removeAllBlocks();
	} );

	afterAll( async () => {
		const [ block ] = await getInstalledBlocks();

		console.log( 'Deactivating: ', block.id );
		await deactivatePlugin( block.id );

		console.log( 'Uninstalling: ', block.id );
		await uninstallPlugin( block.id );
	} );

	it( 'Block returns from API and installs', async () => {
		try {
			const { block } = github.context.payload.client_payload;

			// Search for the block via the inserter
			await searchForBlock( block );

			let addBtn = await page.waitForSelector(
				'.block-directory-downloadable-blocks-list li:first-child button'
			);

			runTest( () => {
				expect( addBtn ).toBeDefined();
			}, "The block wasn't returned from the API." );

			// Add the block
			await addBtn.click();

			// This timeout is necessary to allow the state to update -> Probably a better way.
			await new Promise( ( resolve ) => setTimeout( resolve, 10000 ) );
			const content = await getEditedPostContent();

			runTest( () => {
				expect( content.length ).toBeGreaterThan( 0 );
			}, "Couldn't install the block." );
		} catch ( e ) {
			core.setFailed( e );
		}
	} );
} );
