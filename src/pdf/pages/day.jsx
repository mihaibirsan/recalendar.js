import { Page, View, StyleSheet } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';

import {
	findByDate,
	DATE_FORMAT as SPECIAL_DATES_DATE_FORMAT,
} from 'configuration-form/special-dates';
import Header from 'pdf/components/header';
import Itinerary from 'pdf/components/itinerary';
import MiniCalendar from 'pdf/components/mini-calendar';
import PdfConfig from 'pdf/config';
import { DateContext } from 'pdf/lib/DateContext';
import {
	dayPageLink,
	nextDayPageLink,
	previousDayPageLink,
	monthOverviewLink,
} from 'pdf/lib/links';
import { content, pageStyle } from 'pdf/styles';
import { splitItemsByPages } from 'pdf/utils';

class DayPage extends React.Component {
	styles = StyleSheet.create(
		Object.assign( {}, { content, page: pageStyle( this.props.config ) } ),
	);

	renderExtraItems = ( items, index ) => (
		<Page key={ index } size={ this.props.config.pageSize }>
			<View style={ this.styles.page }>
				<Itinerary items={ items } />
			</View>
		</Page>
	);

	render() {
		const { date, config } = this.props;
		const { items, isEnabled } = config.dayItineraries[ date.weekday() ];
		if ( ! isEnabled ) {
			return null;
		}
		const itemsByPage = splitItemsByPages( items );

		const specialDateKey = this.props.date.format( SPECIAL_DATES_DATE_FORMAT );
		const specialItems = this.props.config.specialDates.filter(
			findByDate( specialDateKey ),
		);
		return (
			<DateContext.Provider value={ date }>
				<Page id={ dayPageLink( date, config ) } size={ config.pageSize }>
					<View style={ this.styles.page }>
						<Header
							isLeftHanded={ config.isLeftHanded }
							title={ date.format( 'MMMM' ) }
							titleLink={ '#' + monthOverviewLink( date, config ) }
							subtitle={ date.format( 'dddd' ) }
							number={ date.format( 'DD' ) }
							previousLink={ '#' + previousDayPageLink( date, config ) }
							nextLink={ '#' + nextDayPageLink( date, config ) }
							calendar={ <MiniCalendar date={ date } config={ config } /> }
							specialItems={ specialItems }
						/>
						<View style={ this.styles.content }>
							<Itinerary items={ itemsByPage[ 0 ] } />
						</View>
					</View>
				</Page>
				{itemsByPage.slice( 1 ).map( this.renderExtraItems )}
			</DateContext.Provider>
		);
	}
}

DayPage.propTypes = {
	config: PropTypes.instanceOf( PdfConfig ).isRequired,
	date: PropTypes.instanceOf( dayjs ).isRequired,
};

export default DayPage;
