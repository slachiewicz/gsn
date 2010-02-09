package gsn.http.rest;

import gsn.DataDistributer;
import gsn.Mappings;
import gsn.VirtualSensorInitializationFailedException;
import gsn.beans.AddressBean;
import gsn.beans.DataField;
import gsn.beans.StreamElement;
import gsn.beans.VSensorConfig;
import gsn.storage.PoolIsFullException;
import gsn.storage.SQLUtils;
import gsn.storage.SQLValidator;
import gsn.storage.StorageManager;
import gsn.utils.Helpers;
import gsn.vsensor.AbstractVirtualSensor;
import gsn.wrappers.AbstractWrapper;

import java.io.IOException;
import java.io.Serializable;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Date;

import javax.naming.OperationNotSupportedException;

import org.apache.log4j.Logger;
import org.joda.time.format.ISODateTimeFormat;

public class LocalDeliveryWrapper extends AbstractWrapper implements DeliverySystem {

	private  final String CURRENT_TIME = ISODateTimeFormat.dateTime().print(System.currentTimeMillis());
	
	private static transient Logger                  logger           = Logger.getLogger( LocalDeliveryWrapper.class );
	
	private VSensorConfig vSensorConfig;
	
	public VSensorConfig getVSensorConfig() {
		return vSensorConfig;
	}
	
	private DataField[] structure;
	
	private DefaultDistributionRequest distributionRequest;

	public String getWrapperName() {
		return "Local-wrapper";
	}

	public boolean initialize() {
		AddressBean params = getActiveAddressBean( );
		String query = params.getPredicateValue("query");		
		String vsName = params.getPredicateValue( "name" );

		if (query==null && vsName == null) {
			logger.error("For using local-wrapper, either >query< or >name< parameters should be specified"); 
			return false;
		}

		if (query == null) 
			query = "select * from "+vsName;

		long lastVisited = -1;
		String startTime = params.getPredicateValueWithDefault("start-time", CURRENT_TIME);
		if (startTime.equals("continue")) {
			Connection conn = null;
			try {
				conn = StorageManager.getInstance().getConnection();
				
				ResultSet rs = conn.getMetaData().getTables(null, null, getActiveAddressBean().getVirtualSensorName(), new String[] {"TABLE"});
				if (rs.next()) {
					StringBuilder dbquery = new StringBuilder();
					dbquery.append("select max(timed) from ").append(getActiveAddressBean().getVirtualSensorName());

					rs = StorageManager.executeQueryWithResultSet(dbquery, conn);
					if (rs.next()) {
						lastVisited = rs.getLong(1);
					}
				}
			} catch (SQLException e) {
				logger.error(e.getMessage(), e);
			} finally {
				StorageManager.close(conn);
			}
		} else {
			try {
				lastVisited = Helpers.convertTimeFromIsoToLong(startTime);
			} catch (Exception e) {
				logger.error("Problem in parsing the start-time parameter, the provided value is:"+startTime+" while a valid input is:"+CURRENT_TIME);
				logger.error(e.getMessage(),e);
				return false;
			}
		}
		logger.info("lastVisited=" + String.valueOf(lastVisited));
		
		try {
			vsName = SQLValidator.getInstance().validateQuery(query);
			if(vsName==null) //while the other instance is not loaded.
				return false;
			query = SQLUtils.newRewrite(query, vsName, vsName.toLowerCase()).toString();
			
			logger.debug("Local wrapper request received for: "+vsName);
			
			vSensorConfig = Mappings.getConfig(vsName);
			distributionRequest = DefaultDistributionRequest.create(this, vSensorConfig, query, lastVisited);
			// This call MUST be executed before adding this listener to the data-distributer because distributer checks the isClose method before flushing.
		}catch (Exception e) {
			logger.error("Problem in the query parameter of the local-wrapper.");
			logger.error(e.getMessage(),e);
			return false;
		}
		return true;
	}

	public boolean sendToWrapper ( String action,String[] paramNames, Serializable[] paramValues ) throws OperationNotSupportedException {
		AbstractVirtualSensor vs;
		try {
			vs = Mappings.getVSensorInstanceByVSName( vSensorConfig.getName( ) ).borrowVS( );
		} catch ( PoolIsFullException e ) {
			logger.warn( "Sending data back to the source virtual sensor failed !: "+e.getMessage( ),e);
			return false;
		} catch ( VirtualSensorInitializationFailedException e ) {
			logger.warn("Sending data back to the source virtual sensor failed !: "+e.getMessage( ),e);
			return false;
		}
		boolean toReturn = vs.dataFromWeb( action , paramNames , paramValues );
		Mappings.getVSensorInstanceByVSName( vSensorConfig.getName( ) ).returnVS( vs );
		return toReturn;
	}
	
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("LocalDistributionReq => [" ).append(distributionRequest.getQuery()).append(", Start-Time: ").append(new Date(distributionRequest.getLastVisitedTime())).append("]");
		return sb.toString();
	}
	
	public void run() {
		DataDistributer localDistributer = DataDistributer.getInstance(LocalDeliveryWrapper.class);
		localDistributer.addListener(this.distributionRequest);
	}

	public void writeStructure(DataField[] fields) throws IOException {
		this.structure=fields;
		
	}
	
	public DataField[] getOutputFormat() {
		return structure;
	}

	public void close() {
		logger.warn("Closing a local delivery.");
		try {
			releaseResources();
		} catch (SQLException e) {
			logger.error(e.getMessage(),e);
		}
		
	}

	public boolean isClosed() {
		return !isActive();
	}

	public boolean writeStreamElement(StreamElement se) {
		boolean isSucced = postStreamElement(se);
		logger.debug("wants to deliver stream element:"+ se.toString()+ "["+isSucced+"]");
		return true;
	}

	public void dispose() {
		
	}


}
