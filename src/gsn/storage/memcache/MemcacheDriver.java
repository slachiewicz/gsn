package gsn.storage.memcache;

import java.io.IOException;
import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverPropertyInfo;
import java.sql.SQLException;
import java.util.Properties;

public class MemcacheDriver implements Driver{
	
	public final static String URL_PREFIX = "jdbc:gsn:memcache:";

	@Override
	public Connection connect(String url, Properties info) throws SQLException {
		if (!acceptsURL(url))
		{
			return null;
		}
		url = url.substring(URL_PREFIX.length());
		try {
			return new MemcacheConnection(url);
		} catch (IOException e) {
			return null;
		}
	}

	@Override
	public boolean acceptsURL(String url) throws SQLException {
		return url.matches(URL_PREFIX + "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?");
	}

	@Override
	public DriverPropertyInfo[] getPropertyInfo(String url, Properties info)
			throws SQLException {
		return new DriverPropertyInfo[0];
	}

	@Override
	public int getMajorVersion() {
		return 0;
	}

	@Override
	public int getMinorVersion() {
		return 1;
	}

	@Override
	public boolean jdbcCompliant() {
		return false;
	}

}
