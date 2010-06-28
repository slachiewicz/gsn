package gsn.storage.hibernate;

import gsn.storage.hibernate.GSNJNDI;
import org.apache.commons.dbcp.BasicDataSource;
import org.apache.log4j.Logger;
import org.hibernate.HibernateException;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.*;
import org.hibernate.engine.SessionFactoryImplementor;
import org.hibernate.tool.hbm2ddl.SchemaExport;
import org.hibernate.tool.hbm2ddl.SchemaValidator;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import java.util.Properties;

public class HibernateUtil {

    private static final transient Logger logger = Logger.getLogger( HibernateUtil.class );

    private static InitialContext mainContext;

    private static Properties props;

    static {
        props = new Properties();
        props.put(Context.INITIAL_CONTEXT_FACTORY, GSNJNDI.class.getCanonicalName());
        try {
            mainContext = new InitialContext(props);
        } catch (NamingException e) {
            logger.error(e.getMessage(), e);
        }
    }

    /**
     * 
     * @param driverClass
     * @param url
     * @param userName
     * @param password
     * @param entityMapping
     * @return
     */
    public static SessionFactory getSessionFactory(String driverClass, String url, String userName, String password, String entityMapping) {
        DBConnectionInfo conn = new DBConnectionInfo(driverClass,url,userName,password);
        try {
            if (mainContext.lookup(Integer.toString(conn.hashCode())) == null){
                BasicDataSource ds = conn.createDataSource();
                mainContext.bind(Integer.toString(conn.hashCode()),ds);
            }
        } catch (NamingException e) {
            logger.error(e.getMessage(), e);
            return null;
        }
        //
        Configuration cfg = new Configuration();
        cfg.setProperty("hibernate.current_session_context_class", "thread");
        cfg.setProperty("hibernate.default_entity_mode", "dynamic-map");
        cfg.setProperty("hibernate.connection.datasource",Integer.toString(conn.hashCode()));
        cfg.setProperty("hibernate.jndi.class", GSNJNDI.class.getCanonicalName());
        cfg.setProperty("hibernate.show_sql", "false");
        cfg.setProperty("hibernate.format_sql", "true");
        cfg.addXML(entityMapping);
        //
        SessionFactory session = null;
        try {
            session = cfg.buildSessionFactory();
        }
        catch(Exception e) {
            logger.error("error: " + e.getMessage());
        }
        //
        cfg.setProperty("hibernate.dialect", ((SessionFactoryImplementor)session).getDialect().toString());
        // Create the table if it does not exist already.
        try {
            // script, export, justDrop, justCreate
            new SchemaExport(cfg).execute(false, true, false, true);
        }
        catch (HibernateException e) {
            logger.error(e.getMessage(), e);
        }
        // Check if the table exists and has the proper outputformat
        try {
            new SchemaValidator(cfg).validate();
        }
        catch (HibernateException e) {
            session = null;
            logger.error("Failed create the table: " + e.getMessage());
        }
        return session;
    }

    public static void closeSessionFactory(SessionFactory sessionFactory) {
        sessionFactory.close();
    }

}
