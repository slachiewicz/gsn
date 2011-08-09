package gsn.http;

import gsn.Main;
import gsn.Mappings;
import gsn.beans.VSensorConfig;
import gsn.http.ac.UserUtils;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.*;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;


public class DynamicGeoDataServlet extends HttpServlet {

    private static transient Logger logger = Logger.getLogger(DynamicGeoDataServlet.class);
    private static final String SEPARATOR = ",";
    private static final String NEWLINE = "\n";

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        String env = HttpRequestUtils.getStringParameter("env", null, request); // e.g. "POLYGON ((0 0, 0 100, 100 100, 100 0, 0 0))";
        String field = HttpRequestUtils.getStringParameter("field", null, request);
        String timed = HttpRequestUtils.getStringParameter("timed", null, request);
        String query = HttpRequestUtils.getStringParameter("query", "value", request);
        String username = HttpRequestUtils.getStringParameter("username", null, request);
        String password = HttpRequestUtils.getStringParameter("password", null, request);

        List<String> allowedSensors = new Vector<String>();

        if (Main.getContainerConfig().isAcEnabled()) {
            if (username != null && password != null) {
                if (UserUtils.allowUserToLogin(username, password) == null) {
                    response.getWriter().write("ERROR: incorrect login for user '" + username + "'. Check your credentials.");
                    return;
                } else { // user authenticated correctly
                    allowedSensors = UserUtils.getAllowedVirtualSensorsForUser(username, password, getAllSensors());
                }

            } else { // username or password is null
                response.getWriter().write("ERROR: username and password required.");
                return;
            }
        } else { // No access control
            allowedSensors = getAllSensors();
        }

        StringBuilder sb = new StringBuilder();

        StringBuilder sqlQueryStr = new StringBuilder();
        for (int i = 0; i < allowedSensors.size(); i++) {
            sqlQueryStr.append("select '" + allowedSensors.get(i) + "'")
                    .append(" as name, timed, from_unixtime(timed/1000), ")
                    .append(field)
                    .append(", latitude, longitude, altitude ")
                    .append(" from ")
                    .append(allowedSensors.get(i))
                    .append(" where timed = ( select max(timed) from ")
                    .append(allowedSensors.get(i))
                    .append(" )")
            //.append(timed)
            ;
            if (i < allowedSensors.size() - 1)
                sqlQueryStr.append("\n union \n");
        }


        sb.append("env = " + env)
                .append("\n")
                .append("field = " + field)
                .append("\n")
                .append("timed = " + timed)
                .append("\n")
                .append("query = " + query)
                .append("\n")
                .append("all_sensors = " + sensorsToString(allowedSensors))
                .append("\n")
                .append(sqlQueryStr)
                .append("\n##############\n")
                .append(executeQuery(sqlQueryStr.toString()));
        logger.warn(sb.toString());
        response.getWriter().write(sb.toString());
    }

    public List<String> getAllSensors() {

        Iterator iter = Mappings.getAllVSensorConfigs();
        List<String> sensors = new Vector<String>();

        while (iter.hasNext()) {
            VSensorConfig sensorConfig = (VSensorConfig) iter.next();
            //Double longitude = sensorConfig.getLongitude();
            //Double latitude = sensorConfig.getLatitude();
            //Double altitude = sensorConfig.getAltitude();
            String sensor = sensorConfig.getName();
            sensors.add(sensor);
        }

        return sensors;
    }

    public String sensorsToString(List<String> sensors) {
        StringBuilder sensorsAsString = new StringBuilder();
        for (String sensor : sensors) {
            sensorsAsString.append(sensor);
            sensorsAsString.append(SEPARATOR);
        }
        if (sensorsAsString.length() > 0)
            sensorsAsString.setLength(sensorsAsString.length() - 1);  // remove the last SEPARATOR

        return sensorsAsString.toString();
    }


    public static String executeQuery(String query) {

        StringBuilder sb = new StringBuilder();
        Connection connection = null;

        try {
            connection = Main.getDefaultStorage().getConnection();
            Statement statement = connection.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
            ResultSet results = statement.executeQuery(query);
            ResultSetMetaData metaData;    // Additional information about the results
            int numCols, numRows;          // How many rows and columns in the table
            metaData = results.getMetaData();       // Get metadata on them
            numCols = metaData.getColumnCount();    // How many columns?
            results.last();                         // Move to last row
            numRows = results.getRow();             // How many rows?

            String s;

            sb.append("# ");

            for (int col = 0; col < numCols; col++) {
                sb.append(metaData.getColumnLabel(col + 1));
                if (col < numCols - 1)
                    sb.append(SEPARATOR);
            }
            sb.append(NEWLINE);

            for (int row = 0; row < numRows; row++) {
                results.absolute(row + 1);                // Go to the specified row
                for (int col = 0; col < numCols; col++) {
                    Object o = results.getObject(col + 1); // Get value of the column
                    //logger.warn(row + " , "+col+" : "+ o.toString());
                    if (o == null)
                        s = "null";
                    else
                        s = o.toString();
                    if (col < numCols - 1)
                        sb.append(s).append(SEPARATOR);
                    else
                        sb.append(s);
                }
                sb.append(NEWLINE);
            }
        } catch (SQLException e) {
            sb.append("ERROR in execution of query: " + e.getMessage());
        } finally {
            Main.getDefaultStorage().close(connection);
        }

        return sb.toString();
    }
}
